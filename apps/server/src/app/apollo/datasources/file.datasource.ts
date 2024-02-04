import { BaseDataSource } from './_base.datasource';
import { FileData, fileRepository } from '../../models';
import { File, FileUploadInput } from '../../_generated/graphql';
import { FileMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { logger } from '@teams2/logger';
import { deleteFileFromBucket } from '../../utils/aws-s3';
import { storagePath } from '../../utils/storage-path';

const logBase = logger('DS:File');

export class FileDataSource extends BaseDataSource {
  async getProgramFiles(programId: ObjectId, checkAccess = true): Promise<File[]> {
    !checkAccess ||
      this.userGuard.isAdmin() ||
      this.userGuard.isCoachOfRegisteredTeamForProgram(programId) ||
      this.userGuard.notAuthorized('Get program files');

    const files = await fileRepository
      .find({ type: 'programDoc', ref: programId.toString() })
      .sort({ name: 1 })
      .exec();
    return files.map(FileMapper.toFile);
  }

  async getEventFiles(eventId: ObjectId, checkAccess = true): Promise<File[]> {
    !checkAccess ||
      this.userGuard.isAdmin() ||
      this.userGuard.isCoachOfRegisteredTeamForEvent(eventId) ||
      this.userGuard.notAuthorized('Get event files');

    const files = await fileRepository
      .find({ type: 'eventDoc', ref: eventId.toString() })
      .sort({ name: 1 })
      .exec();
    return files.map(FileMapper.toFile);
  }

  async addProgramFile(programId: ObjectId, input: FileUploadInput): Promise<File> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Add program file');

    const log = logBase.extend('addPFile');
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
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Add event file');

    const log = logBase.extend('addFFile');
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
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Remove file');

    const log = logBase.extend('removeFile');

    const f = await fileRepository.findByIdAndDelete(fileId).lean().exec();
    log.debug('File removed from repository');

    const result = await deleteFileFromBucket(f.storagePath);
    log.debug('File removed from storage %o', result);

    const ff = FileMapper.toFile(f);
    return ff;
  }
}
