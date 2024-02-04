import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { NoteType } from '../_generated/graphql';

const Types = Schema.Types;

export interface NoteData {
  _id?: ObjectId;
  type: NoteType;
  ref: ObjectId;
  text: string;
  title?: string;
  createdOn: Date;
  createdBy: ObjectId;
  updatedOn?: Date;
  updatedBy?: ObjectId;
  deletedOn?: Date;
  deletedBy?: ObjectId;
}

export type NoteDocument = (Document<unknown, unknown, NoteData> & NoteData) | null;

export interface NoteModel extends Model<NoteData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<NoteData, NoteModel>({
  type: { type: String, required: true },
  ref: { type: Types.ObjectId, required: true },
  text: { type: Types.String, required: true },
  title: { type: Types.String },
  createdOn: { type: Types.Date, required: true },
  createdBy: { type: Types.ObjectId, required: true },
  updatedOn: { type: Types.Date },
  updatedBy: { type: Types.ObjectId },
  deletedOn: { type: Types.Date },
  deletedBy: { type: Types.ObjectId },
});

schema.index({ type: 1, ref: 1, createdOn: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const noteRepository = model<NoteData, NoteModel>('Note', schema);
