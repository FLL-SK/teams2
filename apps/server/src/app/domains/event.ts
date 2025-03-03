import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { ApolloContext } from '../apollo/apollo-context';

import {
  eventRepository,
  PricelistEntryData,
  programRepository,
  registrationRepository,
  userRepository,
} from '../models';
import { emailEventChangedToEventManagers } from '../utils/emails';

import { logger } from '@teams2/logger';
import { RegistrationPayload } from '../_generated/graphql';
import { appPath } from '@teams2/common';
import { issueFoodInvoice, modifyFoodOrderItem } from './registration';

const logLib = logger('domain:Event');

export async function modifyFoodType(
  eventId: ObjectId,
  foodType: PricelistEntryData,
  changedBy: ObjectId,
) {
  const log = logLib.extend('modifyFoodType');
  const event = await eventRepository.findById(eventId).exec();

  if (!event) {
    log.error('Event not found');
    return null;
  }

  const of = event.foodTypes.find((f) => f._id.equals(foodType._id));

  if (!of) {
    log.error('Food type not found');
    return null;
  }

  log.debug('Modifying food type %s', foodType._id);
  const oldFoodType: PricelistEntryData = { n: of.n, up: of.up };

  of.n = foodType.n;
  of.up = foodType.up;
  of.u = foodType.u;

  await event.save();

  const programName = (await programRepository.findById(event.programId).exec()).name;
  // TODO: notify other event managers about food item change
  const emails = (await userRepository.find({ _id: { $in: event.managersIds } }).exec()).map(
    (u) => u.username,
  );
  const eventUrl = getServerConfig().clientAppRootUrl + appPath.event(event._id.toString());
  const change =
    'Bol zmenený typ jedla:' +
    `\nPôvodne: ${oldFoodType.n}, ${oldFoodType.up} EUR` +
    `\nNové: ${foodType.n}, ${foodType.up} EUR `;
  emailEventChangedToEventManagers({
    emails,
    eventName: event.name,
    programName,
    eventUrl,
    change,
    changeTitle: 'Zmena typu jedla',
  });

  // modify food order items for all registrations
  const regs = await registrationRepository
    .find({ eventId: eventId, 'foodOrder.items.productId': foodType._id })
    .exec();

  for (const reg of regs) {
    await modifyFoodOrderItem(reg, foodType, changedBy);
  }

  return event;
}

export async function changeRegisteredEvent(
  registrationId: ObjectId,
  newEventId: ObjectId,
  ctx: ApolloContext,
): Promise<RegistrationPayload> {
  const log = logLib.extend('switch');
  log.info('Switching team registration=%s', registrationId);
  try {
    const registration = await ctx.dataSources.registration.changeRegisteredEvent(
      registrationId,
      newEventId,
    );
    return { registration };
  } catch (e) {
    log.debug(
      'Error switching registration=%s to new event=%s error=%s',
      registrationId,
      newEventId,
      e.message,
    );
    return { errors: [{ code: 'error' }] };
  }
}

export async function issueFoodInvoices(eventId: ObjectId) {
  const log = logLib.extend('issueFoodInvoices');

  log.info('Issuing food invoices for event=%s', eventId);
  const registrations = await registrationRepository.getEventRegistrations(eventId, {
    active: true,
    confirmed: true,
    havingFoodOrder: true,
  });
  log.debug('Found %d registrations having food order', registrations.length);

  const result: RegistrationPayload[] = [];
  for (const r of registrations) {
    if (!r.foodOrder.invoicedOn) {
      log.debug('Issuing food invoice for registration=%s', r._id);
      const rr = await issueFoodInvoice(r._id);
      result.push(rr);
    }
  }

  log.info('Sent %d food invoices', result.length);
  return result;
}
