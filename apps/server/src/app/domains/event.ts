import { appPath } from '@teams2/common';
import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { RegisterTeamPayload, SwitchTeamEventPayload } from '../generated/graphql';
import { ApolloContext } from '../graphql/apollo-context';

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
  emailTeamUnRegisteredToCoach,
  emailTeamUnRegisteredToEventManagers,
} from '../utils/emails';

import { logger } from '@teams2/logger';

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
): Promise<RegisterTeamPayload> {
  const log = logLib.extend('registerTeam');
  log.info('Registering team %s to event %s', teamId, eventId);
  const { userGuard, dataSources } = ctx;

  if (!userGuard.isAdmin() && !(await userGuard.isCoach(teamId))) {
    log.error('Not authorized to register');
    return { error: { code: 'not_authorized' } };
  }

  const team = await dataSources.team.getTeam(teamId);
  if (!team) {
    log.error('Team not found %s', teamId);
    return { error: { code: 'wrong_input', message: 'wrong team id' } };
  }

  // register team to event
  const registration = await dataSources.registration.createRegistration(eventId, teamId);

  if (!registration) {
    return { error: { code: 'registration_failed' } };
  }

  // copy invoice items to registration
  await copyInvoiceItemsToRegistration(registration.id);

  // email notifications
  emailTeamRegistered(registration.id, ctx.user._id);

  const event = await dataSources.event.getEvent(eventId);
  return { event, team };
}

export async function cancelRegistration(id: ObjectId, ctx: ApolloContext) {
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

  const [event, program, eventMgrs, programMgrs, coaches, team] = await Promise.all([
    dataSources.event.getEvent(registration.eventId),
    dataSources.program.getProgram(registration.programId),
    dataSources.event.getEventManagers(registration.eventId),
    dataSources.program.getProgramManagers(registration.programId),
    dataSources.team.getTeamCoaches(registration.teamId),
    dataSources.team.getTeam(registration.teamId),
  ]);

  const mgrEmails = [...eventMgrs.map((m) => m.username), ...programMgrs.map((m) => m.username)];
  const coachEmails = coaches.map((c) => c.username);

  const eventUrl = getServerConfig().clientAppRootUrl + appPath.event(event.id.toString());
  emailTeamUnRegisteredToCoach(coachEmails, team.name, event.name, program.name, eventUrl);
  emailTeamUnRegisteredToEventManagers(mgrEmails, team.name, event.name, program.name, eventUrl);

  return { event, team };
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

export async function switchTeamEvent(
  registrationId: ObjectId,
  newEventId: ObjectId,
  ctx: ApolloContext
): Promise<SwitchTeamEventPayload> {
  const log = logLib.extend('switch');
  log.info('Switching team registration=%s', registrationId);
  try {
    const u = await cancelRegistration(registrationId, ctx);
    const r = await registerTeamToEvent(u.team.id, newEventId, ctx);
    return { team: r.team, oldEvent: u.event, newEvent: r.event };
  } catch (e) {
    log.debug(
      'Error switching registration=%s to new event=%s error=%s',
      registrationId,
      newEventId,
      e.message
    );
    return { error: { code: 'error' } };
  }
}
