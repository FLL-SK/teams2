import { QueryResolvers, MutationResolvers, Team } from '../../_generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getTeam: async (_parent, { id }, { dataSources }) => dataSources.team.getTeam(id),
  getTeams: async (_parent, { filter }, { dataSources }) => dataSources.team.getTeams(filter),
};

export const typeResolver: Resolver<Team> = {
  coaches: async ({ id }, _args, { dataSources }) => dataSources.team.getTeamCoaches(id),
  registrations: async ({ id }, _args, { dataSources }) =>
    dataSources.team.getTeamRegistrations(id),
  tags: async ({ id }, _args, { dataSources }) => dataSources.team.getTeamTags(id),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createTeam: async (_parent, { input }, { dataSources }) => dataSources.team.createTeam(input),
  updateTeam: async (_parent, { id, input }, { dataSources }) =>
    dataSources.team.updateTeam(id, input),
  deleteTeam: async (_parent, { id }, { dataSources }) => dataSources.team.deleteTeam(id),
  undeleteTeam: async (_parent, { id }, { dataSources }) => dataSources.team.undeleteTeam(id),

  addCoachToTeam: (_parent, { teamId, username }, { dataSources }) =>
    dataSources.team.addCoachToTeam(teamId, username),
  removeCoachFromTeam: async (_parent, { teamId, userId }, { dataSources }) =>
    dataSources.team.removeCoachFromTeam(teamId, userId),

  addTagsToTeam: (_parent, { teamId, tagIds }, { dataSources }) =>
    dataSources.team.addTagsToTeam(teamId, tagIds),
  removeTagsFromTeam: async (_parent, { teamId, tagIds }, { dataSources }) =>
    dataSources.team.removeTagsFromTeam(teamId, tagIds),
};
