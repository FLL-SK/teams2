import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { NoteData, noteRepository } from '../../models';
import { Note, NoteCreateInput, NoteType, NoteUpdateInput } from '../../generated/graphql';
import { NoteMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { logger } from '@teams2/logger';
import { FilterQuery } from 'mongoose';

export class NoteDataSource extends BaseDataSource {
  constructor() {
    super();
    this.logBase = logger('DS:Note');
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
  }

  async getNote(id: ObjectId): Promise<Note> {
    const note = await noteRepository.findById(id).exec();
    return NoteMapper.toNote(note);
  }

  async getNotes(type: NoteType, ref: ObjectId, includeDeleted = false): Promise<Note[]> {
    const q: FilterQuery<NoteData> = { type, ref };
    if (!includeDeleted) {
      q.deletedOn = null;
    }
    const notes = await noteRepository.find(q).sort({ createdOn: -1 }).exec();
    return notes.map(NoteMapper.toNote);
  }

  async createNote(input: NoteCreateInput): Promise<Note> {
    const createdBy = this.context.user._id;
    const n: NoteData = { ...input, createdOn: new Date(), createdBy };
    const note = await noteRepository.create(n);
    return NoteMapper.toNote(note);
  }

  async updateNote(id: ObjectId, input: NoteUpdateInput): Promise<Note> {
    const note = await noteRepository.findByIdAndUpdate(id, input, { new: true }).exec();
    return NoteMapper.toNote(note);
  }

  async deleteNote(id: ObjectId): Promise<Note> {
    const note = await noteRepository
      .findByIdAndUpdate(id, { deletedOn: new Date() }, { new: true })
      .exec();
    return NoteMapper.toNote(note);
  }
}
