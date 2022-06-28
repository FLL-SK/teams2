import { appPath } from '@teams2/common';
import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { SwitchTeamEventPayload, UpdateEventInput, UpdateEventPayload } from '../generated/graphql';
import { ApolloContext } from '../graphql/apollo-context';
import { EventMapper, EventTeamMapper } from '../graphql/mappers';
import { EventData, eventRepository } from '../models';
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

export async function registerTeamToEvent(teamId: ObjectId, eventId: ObjectId, ctx: ApolloContext) {
  const { user, dataSources } = ctx;
  if (!user.isAdmin && !user.isCoachOf(teamId)) {
    //TODO nicer error handling
    console.log('Not authorized to register', user.isAdmin, user.isCoachOf(teamId));
    return null;
  }
  const event = await dataSources.event.addTeamToEvent(eventId, teamId);
  const team = await dataSources.team.getTeam(teamId);
  if (!event || !team) {
    return null;
  }

  //TODO promise.all
  const program = await dataSources.program.getProgram(event.programId);
  const eventMgrs = await dataSources.event.getEventManagers(eventId);
  const programMgrs = await dataSources.program.getProgramManagers(event.programId);
  const coaches = await dataSources.team.getTeamCoaches(teamId);

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
  const { user, dataSources } = ctx;

  if (!user.isAdmin && !user.isEventManagerOf(eventId)) {
    //TODO nicer error handling
    console.log('Not authorized to unregister', user.isAdmin, user, user.isEventManagerOf(eventId));
    return null;
  }

  const event = await dataSources.event.removeTeamFromEvent(eventId, teamId);
  const team = await dataSources.team.getTeam(teamId);

  //TODO promise.all
  const program = await dataSources.program.getProgram(event.programId);
  const eventMgrs = await dataSources.event.getEventManagers(eventId);
  const programMgrs = await dataSources.program.getProgramManagers(event.programId);
  const coaches = await dataSources.team.getTeamCoaches(teamId);

  const mgrEmails = [...eventMgrs.map((m) => m.username), ...programMgrs.map((m) => m.username)];
  const coachEmails = coaches.map((c) => c.username);

  const eventUrl = getServerConfig().clientAppRootUrl + appPath.event(event.id.toString());
  emailTeamUnRegisteredToCoach(coachEmails, team.name, event.name, program.name, eventUrl);
  emailTeamUnRegisteredToEventManagers(mgrEmails, team.name, event.name, program.name, eventUrl);

  return { event, team };
}

export async function updateEvent(
  id: ObjectId,
  input: UpdateEventInput,
  ctx: ApolloContext
): Promise<UpdateEventPayload> {
  const { dataSources, user } = ctx;
  const u: Partial<EventData> = input;
  const nu = await eventRepository.findByIdAndUpdate(id, u, { new: true }).exec();

  const eventUrl = getServerConfig().clientAppRootUrl + appPath.event(nu.id.toString());
  const program = await dataSources.program.getProgram(nu.programId);

  // get data for sending emails to coaches
  const teams = await Promise.all(
    (
      await dataSources.event.getEventTeams(id)
    ).map(async (t) => ({
      name: (await dataSources.team.getTeam(t.teamId)).name,
      coaches: (await dataSources.team.getTeamCoaches(t.id)).map((c) => c.username),
    }))
  );

  // send email to coaches of registered teams
  teams.forEach((t) =>
    emailEventChangedToCoach(t.coaches, t.name, nu.name, program.name, eventUrl)
  );

  // get data for sending emails to managers
  const managerEmails = [
    ...(await dataSources.program.getProgramManagers(nu.programId)).map((e) => e.username),
    ...(await dataSources.event.getEventManagers(id)).map((e) => e.username),
  ];
  emailEventChangedToEventManagers(managerEmails, nu.name, program.name, eventUrl);

  return { event: EventMapper.toEvent(nu) };
}

export async function switchTeamEvent(
  teamId: ObjectId,
  oldEventId: ObjectId,
  newEventId: ObjectId,
  ctx: ApolloContext
): Promise<SwitchTeamEventPayload> {
  const { event: oldEvent } = await unregisterTeamFromEvent(teamId, oldEventId, ctx);
  const { team, event: newEvent } = await registerTeamToEvent(teamId, newEventId, ctx);
  return { team, oldEvent, newEvent };
}