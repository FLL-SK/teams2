import { QueryResolvers, MutationResolvers, Tag } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {};

export const typeResolver: Resolver<Tag> = {};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createTag: (_parent, { input }, { dataSources }) => dataSources.tag.createTag(input),
  updateTag: (_parent, { id, input }, { dataSources }) => dataSources.tag.updateTag(id, input),
  deleteTag: (_parent, { id }, { dataSources }) => dataSources.tag.deleteTag(id),
};
