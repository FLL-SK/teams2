import { QueryResolvers, MutationResolvers, Team } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getTeam: async (_parent, { id }, { dataSources }) => dataSources.team.getTeam(id),
  getTeams: async (_parent, _args, { dataSources }) => dataSources.team.getTeams(),
};

export const typeResolver: Resolver<Team> = {};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createTeam: async (_parent, { input }, { dataSources }) => dataSources.team.createTeam(input),
  updateTeam: async (_parent, { id, input }, { dataSources }) =>
    dataSources.team.updateTeam(id, input),
  deleteTeam: async (_parent, { id }, { dataSources }) => dataSources.team.deleteTeam(id),

  addCoachToTeam: (_parent, { teamId, userId }, { dataSources }) =>
    dataSources.team.addCoachToTeam(teamId, userId),
  removeCoachFromTeam: async (_parent, { teamId, userId }, { dataSources }) =>
    dataSources.team.removeCoachFromTeam(teamId, userId),
};
