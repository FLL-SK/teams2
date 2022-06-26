import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { FileData, fileRepository } from '../../models';
import { File, FileUploadInput } from '../../generated/graphql';
import { FileMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { logger } from '@teams2/logger';
import { deleteFileFromBucket } from '../../utils/aws-s3';
import { getPrefixedName } from '../../domains/file';

export class FileDataSource extends BaseDataSource {
  constructor() {
    super();
    this.logBase = logger('DS:File');
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
  }

  async getProgramFiles(programId: ObjectId): Promise<File[]> {
    const files = await fileRepository.find({ programId }).sort({ name: 1 }).exec();
    return files.map(FileMapper.toFile);
  }

  async getEventFiles(eventId: ObjectId): Promise<File[]> {
    const files = await fileRepository.find({ eventId }).sort({ name: 1 }).exec();
    return files.map(FileMapper.toFile);
  }

  async addProgramFile(programId: ObjectId, input: FileUploadInput): Promise<File> {
    const log = this.logBase.extend('addPFile');
    const nf: FileData = {
      programId,
      name: input.name,
      size: input.size,
      type: input.type,
      updatedOn: new Date(),
    };
    log.debug('Adding file %o', nf);
    const f = await fileRepository.create(nf);
    return FileMapper.toFile(f.toObject());
  }

  async addEventFile(eventId: ObjectId, input: FileUploadInput): Promise<File> {
    const log = this.logBase.extend('addFFile');
    const nf: FileData = {
      eventId,
      name: input.name,
      size: input.size,
      type: input.type,
      updatedOn: new Date(),
    };
    log.debug('Adding file %o', nf);

    const f = await fileRepository.create(nf);
    return FileMapper.toFile(f);
  }

  async removeFile(fileId: ObjectId): Promise<File> {
    const log = this.logBase.extend('removeFile');

    const f = await fileRepository.findByIdAndDelete(fileId).lean().exec();
    log.debug('File removed from repository');
    const ff = FileMapper.toFile(f);

    const result = await deleteFileFromBucket(getPrefixedName(ff));
    log.debug('File removed from storage %o', result);

    return ff;
  }
}
