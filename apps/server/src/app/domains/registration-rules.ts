import { ObjectId } from 'mongodb';
import { startOfTodayInTimeZone } from '@teams2/dateutils';
import type { EventData, OrderData, PricelistEntryData, ProgramData } from '../models';
import type { OrderItemInput, RegistrationType } from '../_generated/graphql';

/**
 * Pravidlá registrácie tímu, ktoré predtým kontroloval iba klient (#283).
 * Admin môže výnimočne registrovať aj mimo termínu, bez pozvánky a nad kapacitu.
 */
export type RegistrationRuleError =
  | 'event_not_found'
  | 'event_not_available'
  | 'registration_closed'
  | 'event_past'
  | 'not_invited'
  | 'event_full'
  | 'program_not_found'
  | 'program_not_active'
  | 'program_full'
  | 'registration_type_not_allowed';

interface RuleContext {
  isAdmin: boolean;
  now?: Date;
}

export function checkEventRegistration(
  event: Pick<
    EventData,
    | 'deletedOn'
    | 'archivedOn'
    | 'registrationEnd'
    | 'date'
    | 'invitationOnly'
    | 'invitedTeamsIds'
    | 'maxTeams'
  > | null,
  teamId: ObjectId,
  activeRegistrations: number,
  { isAdmin, now = new Date() }: RuleContext,
): RegistrationRuleError | null {
  if (!event) {
    return 'event_not_found';
  }
  if (event.deletedOn || event.archivedOn) {
    return 'event_not_available';
  }
  if (isAdmin) {
    return null;
  }
  const today = startOfTodayInTimeZone(now);
  // rovnako ako klient: posledný deň registrácie je ešte otvorený
  if (event.registrationEnd && event.registrationEnd.getTime() < today.getTime()) {
    return 'registration_closed';
  }
  if (event.date && event.date.getTime() < today.getTime()) {
    return 'event_past';
  }
  if (event.invitationOnly && !(event.invitedTeamsIds ?? []).some((id) => id.equals(teamId))) {
    return 'not_invited';
  }
  if (event.maxTeams && activeRegistrations >= event.maxTeams) {
    return 'event_full';
  }
  return null;
}

export function checkProgramRegistration(
  program: Pick<
    ProgramData,
    'deletedOn' | 'startDate' | 'endDate' | 'maxTeams' | 'regTypesAllowed'
  > | null,
  type: RegistrationType | null | undefined,
  activeRegistrations: number,
  { isAdmin, now = new Date() }: RuleContext,
): RegistrationRuleError | null {
  if (!program || program.deletedOn) {
    return 'program_not_found';
  }
  if (isAdmin) {
    return null;
  }
  // rovnako ako zoznam aktívnych programov (programRepository.findPrograms({ isActive }))
  if (
    (program.startDate && program.startDate.getTime() >= now.getTime()) ||
    (program.endDate && program.endDate.getTime() < now.getTime())
  ) {
    return 'program_not_active';
  }
  const allowed = program.regTypesAllowed?.length ? program.regTypesAllowed : ['NORMAL'];
  if (!allowed.includes(type ?? 'NORMAL')) {
    return 'registration_type_not_allowed';
  }
  if (program.maxTeams && activeRegistrations >= program.maxTeams) {
    return 'program_full';
  }
  return null;
}

/** maximálny počet kusov jednej položky objednávky jedla */
export const MAX_FOOD_ITEM_QUANTITY = 1000;

/**
 * Zostaví položky objednávky jedla s cenou a názvom z cenníka turnaja (`event.foodTypes`).
 * Cenu ani názov od klienta nepreberá – inak by si tréner mohol objednať jedlo za 0 €. #283
 * Položky s množstvom 0 vynechá; neznámu položku alebo neplatné množstvo odmietne.
 */
export function priceFoodOrderItems(
  items: Pick<OrderItemInput, 'productId' | 'quantity'>[],
  foodTypes: PricelistEntryData[],
): OrderData['items'] {
  const out: OrderData['items'] = [];
  for (const item of items) {
    const quantity = item.quantity;
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_FOOD_ITEM_QUANTITY) {
      throw new Error('Neplatné množstvo v objednávke jedla.');
    }
    if (quantity === 0) {
      continue;
    }
    const productId = new ObjectId(item.productId);
    const ft = foodTypes.find((f) => f._id?.equals(productId));
    if (!ft) {
      throw new Error('Objednávka obsahuje neznámu položku jedla.');
    }
    out.push({
      productId,
      name: ft.n,
      quantity,
      unitPrice: ft.up,
      price: Math.round(quantity * ft.up * 100) / 100,
    });
  }
  return out;
}
