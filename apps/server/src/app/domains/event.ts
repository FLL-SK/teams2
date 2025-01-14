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
import {
  emailEventChangedToCoach,
  emailEventChangedToEventManagers,
  EventChangeNotifyOptions,
} from '../utils/emails';

import { logger } from '@teams2/logger';
import { RegistrationPayload } from '../_generated/graphql';
import { appPath } from '@teams2/common';
import { issueFoodInvoice, modifyFoodOrderItem } from './registration';

const logLib = logger('domain:Event');

export async function notifyEventParticipants(eventId: ObjectId, ctx: ApolloContext) {
  const log = logLib.extend('sendNotify');
  log.debug('Going to sent notifications');
  notifyAboutEventChange(eventId, ctx, emailEventChangedToCoach, emailEventChangedToEventManagers);
}

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

async function getEventEmails(eventId: ObjectId, ctx: ApolloContext) {
  const event = await eventRepository.findById(eventId).exec();
  const program = await ctx.dataSources.program.getProgram(event.programId);

  const regs = await ctx.dataSources.registration.getEventRegistrations(eventId);
  // get data for sending emails to coaches
  const teams = await Promise.all(
    regs.map(async (r) => {
      const team = await ctx.dataSources.team.getTeam(r.teamId);
      const coaches = team.coaches.map((c) => c.username);
      return {
        name: team.name,
        coaches,
        registrationId: r.id,
      };
    }),
  );

  // get data for sending emails to managers
  const managerEmails = [
    ...(await ctx.dataSources.program.getProgramManagers(event.programId)).map((e) => e.username),
    ...(await ctx.dataSources.event.getEventManagers(eventId)).map((e) => e.username),
  ];

  return { teams, managerEmails, event, program };
}

async function notifyAboutEventChange(
  eventId: ObjectId,
  ctx: ApolloContext,
  notifyCoaches: (options: EventChangeNotifyOptions) => void,
  notifyManagers: (options: EventChangeNotifyOptions) => void,
) {
  const { dataSources } = ctx;
  const log = logLib.extend('sendEventChangeNotify');
  log.debug('Going to sent notifications');
  const event = await eventRepository.findById(eventId).exec();

  const eventUrl = getServerConfig().clientAppRootUrl + appPath.event(event._id.toString());
  const program = await dataSources.program.getProgram(event.programId);

  const regs = await dataSources.registration.getEventRegistrations(eventId);
  // get data for sending emails to coaches
  const teams = await Promise.all(
    regs.map(async (r) => {
      const team = await dataSources.team.getTeam(r.teamId);
      const coaches = team.coaches.map((c) => c.username);
      return {
        name: team.name,
        coaches,
        registrationId: r.id,
      };
    }),
  );

  // send email to coaches of registered teams
  log.debug('Sending notitications to %d teams', teams.length);
  teams.forEach((t) =>
    notifyCoaches({
      emails: t.coaches,
      teamName: t.name,
      eventName: event.name,
      programName: program.name,
      eventUrl,
    }),
  );

  // get data for sending emails to managers
  const managerEmails = [
    ...(await dataSources.program.getProgramManagers(event.programId)).map((e) => e.username),
    ...(await dataSources.event.getEventManagers(eventId)).map((e) => e.username),
  ];
  notifyManagers({
    emails: managerEmails,
    eventName: event.name,
    programName: program.name,
    eventUrl,
  });
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

export async function issueFoodInvoices(eventId: ObjectId, ctx: ApolloContext) {
  const log = logLib.extend('issueFoodInvoices');
  log.info('Sending food invoices for event=%s', eventId);
  const registrations = await ctx.dataSources.registration.getEventRegistrations(eventId);
  log.debug('Found %d registrations', registrations.length);
  let count = 0;
  await Promise.all(
    registrations.map(async (r) => {
      if (r.confirmedOn && r.foodOrder && !r.foodOrder.invoicedOn) {
        count++;
        log.debug('Sending food invoice for registration=%s', r.id);
        await issueFoodInvoice(r.id, ctx);
      }
    }),
  );
  log.info('Sent %d food invoices', count);
  return count;
}
