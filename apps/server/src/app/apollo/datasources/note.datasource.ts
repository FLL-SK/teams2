import { BaseDataSource } from './_base.datasource';
import { NoteData, noteRepository } from '../../models';
import { Note, NoteCreateInput, NoteType, NoteUpdateInput } from '../../_generated/graphql';
import { NoteMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { QueryFilter } from 'mongoose';

export class NoteDataSource extends BaseDataSource {
  async getNote(id: ObjectId): Promise<Note> {
    if (!id) return null;
    await this.userGuard.require('Get note', this.userGuard.isAdmin());

    const note = await noteRepository.findById(id).exec();
    return NoteMapper.toNote(note);
  }

  async getNotes(type: NoteType, ref: ObjectId, includeDeleted = false): Promise<Note[]> {
    if (!this.userGuard.isAdmin()) {
      return [];
    }

    const q: QueryFilter<NoteData> = { type, ref };
    if (!includeDeleted) {
      q.deletedOn = null;
    }
    const notes = await noteRepository.find(q).sort({ createdOn: -1 }).exec();
    return notes.map(NoteMapper.toNote);
  }

  async createNote(input: NoteCreateInput): Promise<Note> {
    await this.userGuard.require('Create note', this.userGuard.isAdmin());

    const createdBy = this.context.user._id;
    const n: NoteData = { ...input, createdOn: new Date(), createdBy };
    const note = await noteRepository.create(n);
    return NoteMapper.toNote(note);
  }

  async updateNote(id: ObjectId, input: NoteUpdateInput): Promise<Note> {
    await this.userGuard.require('Update note', this.userGuard.isAdmin());

    const note = await noteRepository
      .findByIdAndUpdate(id, input, { returnDocument: 'after' })
      .exec();
    return NoteMapper.toNote(note);
  }

  async deleteNote(id: ObjectId): Promise<Note> {
    await this.userGuard.require('Delete note', this.userGuard.isAdmin());

    const note = await noteRepository
      .findByIdAndUpdate(id, { deletedOn: new Date() }, { returnDocument: 'after' })
      .exec();
    return NoteMapper.toNote(note);
  }
}
