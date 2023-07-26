import { appPath } from '@teams2/common';
import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { ApolloContext } from '../apollo/apollo-context';

import {
  eventRepository,
  InvoiceItemData,
  invoiceItemRepository,
  registrationRepository,
} from '../models';
import {
  emailEventChangedToCoach,
  emailEventChangedToEventManagers,
  emailTeamRegistered,
  emailTeamUnregistered,
} from '../utils/emails';

import { logger } from '@teams2/logger';
import { Registration, RegistrationPayload } from '../generated/graphql';

const logLib = logger('domain:Event');

async function copyInvoiceItemsToRegistration(registrationId: ObjectId) {
  const reg = await registrationRepository.findById(registrationId).lean().exec();

  let items = await invoiceItemRepository.find({ eventId: reg.eventId }).lean().exec();
  if (items.length === 0) {
    items = await invoiceItemRepository.find({ programId: reg.programId }).lean().exec();
  }

  for (const item of items) {
    const ri: InvoiceItemData = {
      registrationId,
      lineNo: item.lineNo,
      text: item.text,
      note: item.note,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    };
    await invoiceItemRepository.create(ri);
  }
}

export async function registerTeamToEvent(
  teamId: ObjectId,
  eventId: ObjectId,
  ctx: ApolloContext
): Promise<RegistrationPayload> {
  const log = logLib.extend('registerTeam');
  log.info('Registering team %s to event %s', teamId, eventId);
  const { userGuard, dataSources } = ctx;

  if (!userGuard.isAdmin() && !(await userGuard.isCoach(teamId))) {
    log.error('Not authorized to register');
    return { errors: [{ code: 'not_authorized' }] };
  }

  let registration: Registration;
  try {
    // register team to event
    registration = await dataSources.registration.createRegistration(eventId, teamId);

    if (!registration) {
      return { errors: [{ code: 'registration_failed' }] };
    }
  } catch (e) {
    return { errors: [{ code: 'registration_failed' }, { code: e.name }] };
  }

  try {
    // copy invoice items to registration
    await copyInvoiceItemsToRegistration(registration.id);
  } catch (e) {
    log.error('Failed to copy invoice items to registration %s', registration.id);
    return { errors: [{ code: 'registration_failed_to_copy_items' }, { code: e.name }] };
  }

  try {
    // email notifications
    emailTeamRegistered(registration.id, ctx.user._id);
  } catch (e) {
    log.error('Failed to send email to team %s', teamId);
    return { errors: [{ code: 'registration_failed_to_send_email' }, { code: e.name }] };
  }

  return { registration };
}

export async function cancelRegistration(
  id: ObjectId,
  ctx: ApolloContext
): Promise<RegistrationPayload> {
  const { dataSources, userGuard } = ctx;
  const log = logLib.extend('registerTeam');
  const reg = await dataSources.registration.getRegistration(id);

  if (
    !userGuard.isAdmin() &&
    !((await userGuard.isCoach(reg.teamId)) && !reg.invoiceIssuedOn && !reg.shippedOn)
  ) {
    log.debug('Not authorized to cancel registration %s', id);
    return { errors: [{ code: 'not_authorized' }] };
  }

  const registration = await dataSources.registration.cancelRegistration(id);

  if (!registration) {
    return null;
  }

  // email notifications
  emailTeamUnregistered(registration.id, ctx.user._id);

  return { registration };
}

export async function notifyEventParticipants(eventId: ObjectId, ctx: ApolloContext) {
  const { dataSources } = ctx;
  const log = logLib.extend('sendNotify');
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
    }))
  );

  // send email to coaches of registered teams
  log.debug('Sending notitications to %d teams', teams.length);
  teams.forEach((t) =>
    emailEventChangedToCoach(t.coaches, t.name, event.name, program.name, eventUrl)
  );

  // get data for sending emails to managers
  const managerEmails = [
    ...(await dataSources.program.getProgramManagers(event.programId)).map((e) => e.username),
    ...(await dataSources.event.getEventManagers(eventId)).map((e) => e.username),
  ];
  emailEventChangedToEventManagers(managerEmails, event.name, program.name, eventUrl);
}

export async function changeRegisteredEvent(
  registrationId: ObjectId,
  newEventId: ObjectId,
  ctx: ApolloContext
): Promise<RegistrationPayload> {
  const log = logLib.extend('switch');
  log.info('Switching team registration=%s', registrationId);
  try {
    const registration = await ctx.dataSources.registration.changeRegisteredEvent(
      registrationId,
      newEventId
    );
    return { registration };
  } catch (e) {
    log.debug(
      'Error switching registration=%s to new event=%s error=%s',
      registrationId,
      newEventId,
      e.message
    );
    return { errors: [{ code: 'error' }] };
  }
}
