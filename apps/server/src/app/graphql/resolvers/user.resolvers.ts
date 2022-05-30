import { QueryResolvers, MutationResolvers, User } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getUser: async (_parent, { id }, { dataSources }) => dataSources.user.getUser(id),
  getUsers: async (_parent, _args, { dataSources }) => dataSources.user.getUsers(),
};

export const typeResolver: Resolver<User> = {
  coachingTeams: async ({ id }, _args, { dataSources }) => dataSources.team.getTeamsCoachedBy(id),
  managingEvents: async ({ id }, _args, { dataSources }) =>
    dataSources.event.getEventsManagedBy(id),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createUser: async (_parent, { input }, { dataSources }) => dataSources.user.createUser(input),
  updateUser: async (_parent, { id, input }, { dataSources }) =>
    dataSources.user.updateUser(id, input),
  deleteUser: async (_parent, { id }, { dataSources }) => dataSources.user.deleteUser(id),
  changeUserPassword: async (_parent, { id, password }, { dataSources }) =>
    dataSources.user.changePassword(id, password),
};
