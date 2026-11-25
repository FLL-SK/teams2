import { QueryResolvers, MutationResolvers, File } from '../../_generated/graphql';
import { getSignedUrlForDownload } from '../../utils/aws-s3';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getProgramFiles: async (_parent, { programId }, { dataSources }) =>
    dataSources.file.getProgramFiles(programId),
  getEventFiles: async (_parent, { eventId }, { dataSources }) =>
    dataSources.file.getEventFiles(eventId),
  getProgramFileUploadUrl: async (_parent, { programId, input }, { dataSources }) =>
    dataSources.file.getProgramFileUploadUrl(programId, input),
  getEventFileUploadUrl: async (_parent, { eventId, input }, { dataSources }) =>
    dataSources.file.getEventFileUploadUrl(eventId, input),
};

export const typeResolver: Resolver<File> = {
  url: async (parent, _args, _ds) => getSignedUrlForDownload(parent.storagePath, parent.type),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  addProgramFile: async (_parent, { programId, input }, { dataSources }) =>
    dataSources.file.addProgramFile(programId, input),
  addEventFile: async (_parent, { eventId, input }, { dataSources }) =>
    dataSources.file.addEventFile(eventId, input),
  removeFile: async (_parent, { fileId }, { dataSources }) => dataSources.file.removeFile(fileId),
};
