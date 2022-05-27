import { QueryResolvers, MutationResolvers, Event } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getEvent: async (_parent, { id }, { dataSources }) => dataSources.event.getEvent(id),
  getEvents: async (_parent, _args, { dataSources }) => dataSources.event.getEvents(),
};

export const typeResolver: Resolver<Event> = {};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createEvent: async (_parent, { input }, { dataSources }) => dataSources.event.createEvent(input),
  updateEvent: async (_parent, { id, input }, { dataSources }) =>
    dataSources.event.updateEvent(id, input),
  deleteEvent: async (_parent, { id }, { dataSources }) => dataSources.event.deleteEvent(id),

  addTeamToEventasync: (_parent, { eventId, teamId }, { dataSources }) =>
    dataSources.event.addTeamToEvent(eventId, teamId),
  removeTeamFromEvent: async (_parent, { eventId, teamId }, { dataSources }) =>
    dataSources.event.removeTeamFromEvent(eventId, teamId),

  addEventManager: async (_parent, { eventId, userId }, { dataSources }) =>
    dataSources.event.addEventManager(eventId, userId),
  removeEventManager: async (_parent, { eventId, userId }, { dataSources }) =>
    dataSources.event.removeEventManager(eventId, userId),
};
