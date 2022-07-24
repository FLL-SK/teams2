import {
  EventData,
  eventRepository,
  RegistrationData,
  registrationRepository,
  InvoiceItemData,
  invoiceItemRepository,
  programRepository,
  teamRepository,
  userRepository,
} from '../../models';
import { addDays } from 'date-fns';
import { logger } from '@teams2/logger';

type TestSeedData = Omit<
  RegistrationData,
  'teamId' | 'eventId' | 'programId' | 'registeredOn' | 'registeredBy' | 'billTo' | 'shipTo'
> & {
  event: string;
  team: string;
  registeredOnOffset: number;
  invoicedOnOffset?: number;

  girlCount?: number;
  boyCount?: number;
  coachCount?: number;
};

export const seedTestRegistrationData: TestSeedData[] = [
  {
    event: 'Event1',
    team: 'Team1',
    registeredOnOffset: -20,
    invoicedOnOffset: -19,
    girlCount: 3,
    boyCount: 5,
    coachCount: 1,
  },
  {
    event: 'Event2',
    team: 'Team2',
    registeredOnOffset: -2,
    invoicedOnOffset: -1,
    girlCount: 2,
    boyCount: 1,
    coachCount: 2,
  },
  {
    event: 'Event2',
    team: 'Team3',
    registeredOnOffset: -2,
    invoicedOnOffset: -1,
  },
  {
    event: 'Event3',
    team: 'Team3',
    registeredOnOffset: -2,
    invoicedOnOffset: -1,
  },
];

const log = logger('testseed:Registrations');

export async function seedTestRegistrations() {
  const adminUser = await userRepository.findOne({ email: 'admin@test' }).exec();
  for (const d of seedTestRegistrationData) {
    const e = await eventRepository.findOne({ name: d.event }).exec();
    if (!e) {
      throw new Error(`Event ${d.event} not found`);
    }
    const t = await teamRepository.findOne({ name: d.team }).exec();
    if (!t) {
      throw new Error(`Team ${d.team} not found`);
    }
    const regOn = addDays(new Date(), d.registeredOnOffset);
    const invoicedOn = d.invoicedOnOffset ? addDays(new Date(), d.invoicedOnOffset) : undefined;

    const et: RegistrationData = {
      programId: e.programId,
      eventId: e._id,
      teamId: t._id,
      billTo: t.billTo ?? t.address,
      shipTo: t.shipTo ?? t.billTo ?? t.address,
      registeredOn: regOn,
      registeredBy: t.coachesIds.length > 0 ? t.coachesIds[0] : adminUser._id,
      invoiceIssuedOn: invoicedOn,
      invoiceIssuedBy: invoicedOn ? adminUser._id : undefined,
      girlCount: d.girlCount ?? 0,
      boyCount: d.boyCount ?? 0,
      coachCount: d.coachCount ?? 0,
    };
    const r = await registrationRepository.create(et);

    const p = await programRepository.findOne({ _id: e.programId }).exec();
    let invoiceItems = await invoiceItemRepository.find({ eventId: e._id }).exec();
    if (invoiceItems.length === 0) {
      invoiceItems = await invoiceItemRepository.find({ programId: p._id }).exec();
    }
    for (const ii of invoiceItems) {
      const iit: InvoiceItemData = {
        registrationId: r._id,
        lineNo: ii.lineNo,
        text: ii.text,
        note: ii.note,
        quantity: ii.quantity,
        unitPrice: ii.unitPrice,
      };
      await invoiceItemRepository.create(iit);
    }

    log.debug(`Registration created event=%s team=%s id=%s`, d.event, d.team, r._id.toHexString());
  }
}
