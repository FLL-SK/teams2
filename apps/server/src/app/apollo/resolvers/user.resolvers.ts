import { QueryResolvers, MutationResolvers, User } from '../../_generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getUser: async (_parent, { id }, { dataSources }) => dataSources.user.getUser(id),
  getUsers: async (_parent, { filter }, { dataSources }) => dataSources.user.getUsers(filter),
};

export const typeResolver: Resolver<User> = {
  coachingTeams: async ({ id }, _args, { dataSources }) => dataSources.team.getTeamsCoachedBy(id),
  managingEvents: async ({ id }, _args, { dataSources }) =>
    dataSources.event.getEventsManagedBy(id),
  managingPrograms: async ({ id }, _args, { dataSources }) =>
    dataSources.program.getProgramsManagedBy(id),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  updateUser: async (_parent, { id, input }, { dataSources }) =>
    dataSources.user.updateUser(id, input),
  deleteUser: async (_parent, { id }, { dataSources }) => dataSources.user.deleteUser(id),
  undeleteUser: async (_parent, { id }, { dataSources }) => dataSources.user.undeleteUser(id),
  changeUserPassword: async (_parent, { id, password }, { dataSources }) =>
    dataSources.user.changePassword(id, password),
  setAdmin: async (_parent, { id, isAdmin }, { dataSources }) =>
    dataSources.user.setAdmin(id, isAdmin),
  declineGdpr: async (_parent, { id }, { dataSources }) => dataSources.user.declineGdpr(id),
};
