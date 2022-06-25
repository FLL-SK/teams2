import { appPath } from '@teams2/common';
import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { ApolloContext } from '../graphql/apollo-context';
import {
  emailTeamRegisteredToCoach,
  emailTeamRegisteredToEventManagers,
  emailTeamUnRegisteredToCoach,
  emailTeamUnRegisteredToEventManagers,
} from '../utils/emails';

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

  emailTeamUnRegisteredToCoach(
    coachEmails,
    team.name,
    event.name,
    program.name,
    getServerConfig().clientAppRootUrl + appPath.event(event.id.toString())
  );
  emailTeamUnRegisteredToEventManagers(
    mgrEmails,
    team.name,
    event.name,
    program.name,
    getServerConfig().clientAppRootUrl + appPath.event(event.id.toString())
  );

  return { event, team };
}
