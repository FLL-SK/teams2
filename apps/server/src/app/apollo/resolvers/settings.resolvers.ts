import { QueryResolvers, MutationResolvers, Settings } from '../../_generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getSettings: async (_parent, _args, { dataSources }) => dataSources.settings.get(),
};

export const typeResolver: Resolver<Settings> = {};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  updateSettings: async (_parent, { input }, { dataSources }) => dataSources.settings.put(input),
};
