import { QueryResolvers, MutationResolvers, File } from '../../generated/graphql';
import { getSignedUrlForDownload, getSignedUrlForUpload } from '../../utils/aws-s3';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getProgramFiles: async (_parent, { programId }, { dataSources }) =>
    dataSources.program.getFiles(programId),
  getEventFiles: async (_parent, { eventId }, { dataSources }) =>
    dataSources.event.getFiles(eventId),
};

export const typeResolver: Resolver<File> = {
  url: async ({ name, type }, _args, _ds) => getSignedUrlForDownload(name, type),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  requestFileUpload: async (_parent, { input }, _ds) =>
    getSignedUrlForUpload(input.name, input.type),
};
