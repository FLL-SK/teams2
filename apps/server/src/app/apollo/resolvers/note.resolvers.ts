import { QueryResolvers, MutationResolvers, Note } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getNote: async (_parent, { id }, { dataSources }) => dataSources.note.getNote(id),
  getNotes: async (_parent, { type, ref, includeDeleted }, { dataSources }) =>
    dataSources.note.getNotes(type, ref, includeDeleted),
};

export const typeResolver: Resolver<Note> = {
  creator: async ({ createdBy }, _args, { dataSources }) => dataSources.user.getUser(createdBy),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createNote: (_parent, { input }, { dataSources }) => dataSources.note.createNote(input),
  updateNote: (_parent, { id, input }, { dataSources }) => dataSources.note.updateNote(id, input),
  deleteNote: (_parent, { id }, { dataSources }) => dataSources.note.deleteNote(id),
};
