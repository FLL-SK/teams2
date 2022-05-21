import { QueryResolvers, MutationResolvers, User } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getUser: async (_parent, { id }, { dataSources }) => dataSources.user.getUser(id),
  getProfile: async (_parent, { username }, { dataSources }) =>
    dataSources.user.getUserByUsername(username),
};

export const typeResolver: Resolver<User> = {};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createUser: async (_parent, { input }, { dataSources }) => dataSources.user.createUser(input),
  deleteUser: async (_parent, { id }, { dataSources }) => dataSources.user.deleteUser(id),
};
