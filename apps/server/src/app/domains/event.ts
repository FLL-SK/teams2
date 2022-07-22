import { appPath } from '@teams2/common';
import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { RegisterTeamPayload, SwitchTeamEventPayload } from '../generated/graphql';
import { ApolloContext } from '../graphql/apollo-context';
import { eventRepository } from '../models';
import {
  emailEventChangedToCoach,
  emailEventChangedToEventManagers,
  emailTeamRegisteredToCoach,
  emailTeamRegisteredToEventManagers,
  emailTeamUnRegisteredToCoach,
  emailTeamUnRegisteredToEventManagers,
} from '../utils/emails';

import { logger } from '@teams2/logger';

const logLib = logger('domain:Event');

export async function registerTeamToEvent(
  teamId: ObjectId,
  eventId: ObjectId,
  ctx: ApolloContext
): Promise<RegisterTeamPayload> {
  const log = logLib.extend('registerTeam');
  log.info('Registering team %s to event %s', teamId, eventId);
  const { userGuard, dataSources } = ctx;

  if (!userGuard.isAdmin() && !(await userGuard.isCoach(teamId))) {
    //TODO nicer error handling
    console.log('Not authorized to register');
    return null;
  }

  const team = await dataSources.team.getTeam(teamId);
  const registration = await dataSources.registration.createRegistration(eventId, teamId);

  if (!registration || !team) {
    return null;
  }

  const [event, program, eventMgrs, programMgrs, coaches] = await Promise.all([
    dataSources.event.getEvent(eventId),
    dataSources.program.getProgram(registration.programId),
    dataSources.event.getEventManagers(eventId),
    dataSources.program.getProgramManagers(registration.programId),
    dataSources.team.getTeamCoaches(teamId),
  ]);

  const mgrEmails = [...eventMgrs.map((m) => m.username), ...programMgrs.map((m) => m.username)];
  const coachEmails = coaches.map((c) => c.username);

  emailTeamRegisteredToCoach(
    coachEmails,
    team.name,
    event.name,
    program.name,
    getServerConfig().clientAppRootUrl + appPath.event(event.id.toString())
  );
  emailTeamRegisteredToEventManagers(
    mgrEmails,
    team.name,
    event.name,
    program.name,
    getServerConfig().clientAppRootUrl + appPath.event(event.id.toString())
  );

  return { event, team };
}

export async function unregisterTeamFromEvent(
  teamId: ObjectId,
  eventId: ObjectId,
  ctx: ApolloContext
) {
  const { dataSources, userGuard } = ctx;

  if (!userGuard.isAdmin() && !(await userGuard.isEventManager(eventId))) {
    //TODO nicer error handling
    console.log('Not authorized to unregister');
    return null;
  }

  const registration = await dataSources.registration.deleteRegistrationET(eventId, teamId);
  const team = await dataSources.team.getTeam(teamId);

  if (!registration || !team) {
    return null;
  }

  const [event, program, eventMgrs, programMgrs, coaches] = await Promise.all([
    dataSources.event.getEvent(eventId),
    dataSources.program.getProgram(registration.programId),
    dataSources.event.getEventManagers(eventId),
    dataSources.program.getProgramManagers(registration.programId),
    dataSources.team.getTeamCoaches(teamId),
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
  teamId: ObjectId,
  oldEventId: ObjectId,
  newEventId: ObjectId,
  ctx: ApolloContext
): Promise<SwitchTeamEventPayload> {
  const log = logLib.extend('switch');
  log.info('Switching team %s from ev1 %s to ev2 %s', teamId, oldEventId, newEventId);
  const { event: oldEvent } = await unregisterTeamFromEvent(teamId, oldEventId, ctx);
  const { team, event: newEvent } = await registerTeamToEvent(teamId, newEventId, ctx);
  return { team, oldEvent, newEvent };
}
