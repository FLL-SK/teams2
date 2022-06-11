import { QueryResolvers, MutationResolvers, Program } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getProgram: async (_parent, { id }, { dataSources }) => dataSources.program.getProgram(id),
  getPrograms: async (_parent, _args, { dataSources }) => dataSources.program.getPrograms(),
};

export const typeResolver: Resolver<Program> = {
  managers: async ({ id }, _args, { dataSources }) => dataSources.program.getProgramManagers(id),
  events: async ({ id }, _args, { dataSources }) => dataSources.program.getProgramEvents(id),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createProgram: (_parent, { input }, { dataSources }) => dataSources.program.createProgram(input),
  updateProgram: (_parent, { id, input }, { dataSources }) =>
    dataSources.program.updateProgram(id, input),
  deleteProgram: (_parent, { id }, { dataSources }) => dataSources.program.deleteProgram(id),

  addProgramManager: (_parent, { programId, userId }, { dataSources }) =>
    dataSources.program.addProgramManager(programId, userId),
  removeProgramManager: (_parent, { programId, userId }, { dataSources }) =>
    dataSources.program.removeProgramManager(programId, userId),
};
