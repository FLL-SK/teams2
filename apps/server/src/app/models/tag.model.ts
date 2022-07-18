import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { TagColorType } from '../generated/graphql';

const Types = Schema.Types;

export interface TagData {
  _id?: ObjectId;
  label: string; // tag text
  color: TagColorType; // tag color
  deletedOn?: Date;
  deletedBy?: ObjectId;
}

export type TagDocument = (Document<unknown, unknown, TagData> & TagData) | null;

export interface TagModel extends Model<TagData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<TagData, TagModel>({
  label: { type: Types.String, required: true },
  color: { type: Types.String, required: true },
  deletedOn: { type: Types.Date },
  deletedBy: { type: Types.ObjectId },
});

schema.index({ text: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const tagRepository = model<TagData, TagModel>('Tag', schema);
