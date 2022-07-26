import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { FileData, fileRepository } from '../../models';
import { File, FileUploadInput } from '../../generated/graphql';
import { FileMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { logger } from '@teams2/logger';
import { deleteFileFromBucket } from '../../utils/aws-s3';
import { storagePath } from '../../utils/storage-path';

export class FileDataSource extends BaseDataSource {
  constructor() {
    super();
    this.logBase = logger('DS:File');
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
  }

  async getProgramFiles(programId: ObjectId): Promise<File[]> {
    const files = await fileRepository
      .find({ type: 'programDoc', ref: programId.toString() })
      .sort({ name: 1 })
      .exec();
    return files.map(FileMapper.toFile);
  }

  async getEventFiles(eventId: ObjectId): Promise<File[]> {
    const files = await fileRepository
      .find({ type: 'eventDoc', ref: eventId.toString() })
      .sort({ name: 1 })
      .exec();
    return files.map(FileMapper.toFile);
  }

  async addProgramFile(programId: ObjectId, input: FileUploadInput): Promise<File> {
    const log = this.logBase.extend('addPFile');
    const nf: FileData = {
      type: 'programDoc',
      ref: programId.toString(),
      name: input.name,
      storagePath: storagePath(input.name, 'programDoc', programId.toString()),
      size: input.size,
      contentType: input.contentType,
      updatedOn: new Date(),
    };
    log.debug('Adding file %o', nf);
    const f = await fileRepository.create(nf);
    return FileMapper.toFile(f.toObject());
  }

  async addEventFile(eventId: ObjectId, input: FileUploadInput): Promise<File> {
    const log = this.logBase.extend('addFFile');
    const nf: FileData = {
      type: 'eventDoc',
      ref: eventId.toString(),
      name: input.name,
      storagePath: storagePath(input.name, 'eventDoc', eventId.toString()),
      size: input.size,
      contentType: input.contentType,
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

    const result = await deleteFileFromBucket(f.storagePath);
    log.debug('File removed from storage %o', result);

    const ff = FileMapper.toFile(f);
    return ff;
  }
}
