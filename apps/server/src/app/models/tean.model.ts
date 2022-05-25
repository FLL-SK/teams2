import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';

const Types = Schema.Types;

export interface TeamData {
  _id?: ObjectId;
  name: string;
  deletedOn?: Date;
  deletedBy?: ObjectId;
  coachesIds: ObjectId[];
}

export type TeamDocument = (Document<unknown, unknown, TeamData> & TeamData) | null;

export interface TeamModel extends Model<TeamData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<TeamData, TeamModel>({
  name: { type: Types.String, required: true },
  deletedOn: { type: Types.Date },
  deletedBy: { type: Types.ObjectId, ref: 'User' },
  coachesIds: [{ type: Types.ObjectId, ref: 'User', default: [] }],
});

schema.index({ name: 1 }, { unique: false });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const teamRepository = model<TeamData, TeamModel>('Team', schema);
