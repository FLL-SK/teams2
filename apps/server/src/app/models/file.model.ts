import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';

const Types = Schema.Types;

export interface FileData {
  _id?: ObjectId;
  programId?: ObjectId;
  eventId?: ObjectId;
  teamId?: ObjectId;
  name: string;
  size: number;
  type: string;
  updatedOn: Date;
}

export type FileDocument = (Document<unknown, unknown, FileData> & FileData) | null;

export interface FileModel extends Model<FileData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<FileData, FileModel>({
  programId: { type: Types.ObjectId, ref: 'Program', required: true },
  eventId: { type: Types.ObjectId, ref: 'Event', required: true },
  teamId: { type: Types.ObjectId, ref: 'Team', required: true },
  name: { type: Types.String, required: true },
  size: { type: Types.Number, required: true },
  type: { type: Types.String, required: true },
  updatedOn: { type: Types.Date, required: true },
});

schema.index({ programId: 1 });
schema.index({ eventId: 1 });
schema.index({ teamId: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const fileRepository = model<FileData, FileModel>('File', schema);
