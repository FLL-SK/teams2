import {
  QueryResolvers,
  MutationResolvers,
  Event,
  RegisterTeamPayload,
} from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getEvent: async (_parent, { id }, { dataSources }) => dataSources.event.getEvent(id),
  getEvents: async (_parent, _args, { dataSources }) => dataSources.event.getEvents(),
};

export const typeResolver: Resolver<Event> = {
  teams: async ({ id }, _args, { dataSources }) => dataSources.event.getEventTeams(id),
  managers: async ({ id }, _args, { dataSources }) => dataSources.event.getEventManagers(id),
  program: async ({ programId }, _args, { dataSources }) =>
    dataSources.program.getProgram(programId),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createEvent: (_parent, { input }, { dataSources }) => dataSources.event.createEvent(input),
  updateEvent: (_parent, { id, input }, { dataSources }) =>
    dataSources.event.updateEvent(id, input),
  deleteEvent: (_parent, { id }, { dataSources }) => dataSources.event.deleteEvent(id),

  registerTeamForEvent: async (
    _parent,
    { input },
    { dataSources }
  ): Promise<RegisterTeamPayload> => {
    const { eventId, teamId } = input;
    const event = await dataSources.event.addTeamToEvent(eventId, teamId);
    const team = await dataSources.team.getTeam(teamId);
    if (!event || !team) {
      return null;
    }
    return { event, team };
  },

  unregisterTeamFromEvent: async (_parent, { eventId, teamId }, { dataSources }) => {
    const event = await dataSources.event.removeTeamFromEvent(eventId, teamId);
    const team = await dataSources.team.getTeam(teamId);
    return { event, team };
  },

  addEventManager: (_parent, { eventId, userId }, { dataSources }) =>
    dataSources.event.addEventManager(eventId, userId),
  removeEventManager: (_parent, { eventId, userId }, { dataSources }) =>
    dataSources.event.removeEventManager(eventId, userId),
};
