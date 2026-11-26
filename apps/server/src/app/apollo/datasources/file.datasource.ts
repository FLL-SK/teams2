import { BaseDataSource } from './_base.datasource';
import { FileData, fileRepository } from '../../models';
import { File, FileUploadInput } from '../../_generated/graphql';
import { FileMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { logger } from '@teams2/logger';
import { deleteFileFromBucket, getSignedUrlForUpload } from '../../utils/aws-s3';
import { storagePath } from '../../utils/storage-path';

const logBase = logger('DS:File');

export class FileDataSource extends BaseDataSource {
  async getProgramFiles(programId: ObjectId, checkAccess = true): Promise<File[]> {
    if (checkAccess) {
      await this.userGuard.require('Get program files', this.userGuard.isAdmin(), () =>
        this.userGuard.isCoachOfRegisteredTeamForProgram(programId),
      );
    }

    const files = await fileRepository
      .find({ type: 'programDoc', ref: programId.toString() })
      .sort({ name: 1 })
      .exec();
    return files.map(FileMapper.toFile);
  }

  async getEventFiles(eventId: ObjectId, checkAccess = true): Promise<File[]> {
    if (checkAccess) {
      await this.userGuard.require('Get event files', this.userGuard.isAdmin(), () =>
        this.userGuard.isCoachOfRegisteredTeamForEvent(eventId),
      );
    }

    const files = await fileRepository
      .find({ type: 'eventDoc', ref: eventId.toString() })
      .sort({ name: 1 })
      .exec();
    return files.map(FileMapper.toFile);
  }

  // nahrávať súbory môže iba admin – rovnako ako addProgramFile/addEventFile
  async getProgramFileUploadUrl(programId: ObjectId, input: FileUploadInput): Promise<string> {
    await this.userGuard.require('Get program file upload URL', this.userGuard.isAdmin());
    return getSignedUrlForUpload(
      storagePath(input.name, 'programDoc', programId.toString()),
      input.contentType,
    );
  }

  async getEventFileUploadUrl(eventId: ObjectId, input: FileUploadInput): Promise<string> {
    await this.userGuard.require('Get event file upload URL', this.userGuard.isAdmin());
    return getSignedUrlForUpload(
      storagePath(input.name, 'eventDoc', eventId.toString()),
      input.contentType,
    );
  }

  async addProgramFile(programId: ObjectId, input: FileUploadInput): Promise<File> {
    await this.userGuard.require('Add program file', this.userGuard.isAdmin());

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
    await this.userGuard.require('Add event file', this.userGuard.isAdmin());

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
    await this.userGuard.require('Remove file', this.userGuard.isAdmin());

    const log = logBase.extend('removeFile');

    const f = await fileRepository.findByIdAndDelete(fileId).lean().exec();
    log.debug('File removed from repository');

    const result = await deleteFileFromBucket(f.storagePath);
    log.debug('File removed from storage %o', result);

    const ff = FileMapper.toFile(f);
    return ff;
  }
}
