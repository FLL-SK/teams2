import { QueryResolvers, MutationResolvers, EventTeam } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {};

export const typeResolver: Resolver<EventTeam> = {
  team: async ({ teamId }, _args, { dataSources }) => dataSources.team.getTeam(teamId),
  event: async ({ eventId }, _args, { dataSources }) => dataSources.event.getEvent(eventId),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {};
