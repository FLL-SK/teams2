import { QueryResolvers, MutationResolvers, File } from '../../generated/graphql';
import { getSignedUrlForDownload, getSignedUrlForUpload } from '../../utils/aws-s3';
import { storagePath } from '../../utils/storage-path';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getProgramFiles: async (_parent, { programId }, { dataSources }) =>
    dataSources.file.getProgramFiles(programId),
  getEventFiles: async (_parent, { eventId }, { dataSources }) =>
    dataSources.file.getEventFiles(eventId),
  getProgramFileUploadUrl: async (_parent, { programId, input }, _ds) =>
    getSignedUrlForUpload(
      storagePath(input.name, 'programDoc', programId.toString()),
      input.contentType
    ),
  getEventFileUploadUrl: async (_parent, { eventId, input }, _ds) =>
    getSignedUrlForUpload(
      storagePath(input.name, 'eventDoc', eventId.toString()),
      input.contentType
    ),
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
