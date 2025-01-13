import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { ApolloContext } from '../apollo/apollo-context';

import { eventRepository, PricelistEntryData } from '../models';
import {
  emailEventChangedToCoach,
  emailEventChangedToEventManagers,
  emailFoodItemChanged,
  EventChangeNotifyOptions,
} from '../utils/emails';

import { logger } from '@teams2/logger';
import { RegistrationPayload } from '../_generated/graphql';
import { appPath } from '@teams2/common';
import { issueFoodInvoice } from './registration';

const logLib = logger('domain:Event');

export async function notifyEventParticipants(eventId: ObjectId, ctx: ApolloContext) {
  const log = logLib.extend('sendNotify');
  log.debug('Going to sent notifications');
  notifyAboutEventChange(eventId, ctx, emailEventChangedToCoach, emailEventChangedToEventManagers);
}

export async function notifyEventFoodItemChanged(
  ctx: ApolloContext,
  eventId: ObjectId,
  foodItemOld: PricelistEntryData,
  foodItemNew: PricelistEntryData,
) {
  const log = logLib.extend('sendNotifyFoodItemChanged');
  log.debug('Going to sent notifications');
  notifyAboutEventChange(eventId, ctx, emailFoodItemChanged, emailFoodItemChanged);
}

export async function notifyAboutEventChange(
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

  const evt = await dataSources.registration.getEventRegistrations(eventId);
  // get data for sending emails to coaches
  const teams = await Promise.all(
    evt.map(async (t) => ({
      name: (await dataSources.team.getTeam(t.teamId)).name,
      coaches: (await dataSources.team.getTeamCoaches(t.id)).map((c) => c.username),
      registrationId: t.id,
    })),
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
