import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { FileType } from '../generated/graphql';

const Types = Schema.Types;

export interface FileData {
  _id?: ObjectId;
  type: FileType;
  ref: string; // programId or eventId
  name: string; // file name visible to user
  storagePath: string; // full file name in file storage
  size: number;
  contentType: string;
  updatedOn: Date;
}

export type FileDocument = (Document<unknown, unknown, FileData> & FileData) | null;

export interface FileModel extends Model<FileData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<FileData, FileModel>(
  {
    type: { type: String, required: true },
    ref: { type: Types.String, required: true },
    name: { type: Types.String, required: true },
    storagePath: { type: Types.String, required: true },
    size: { type: Types.Number, required: true },
    contentType: { type: Types.String, required: true },
    updatedOn: { type: Types.Date, required: true },
  },
  { collation: { locale: 'sk', strength: 1 } }
);

schema.index({ ttype: 1, ref: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const fileRepository = model<FileData, FileModel>('File', schema);
