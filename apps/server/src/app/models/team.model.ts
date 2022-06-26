import { Schema, model, Model, Document, ProjectionType } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { AddressData, addressSchema } from './address.model';

const Types = Schema.Types;

export interface TeamData {
  _id?: ObjectId;
  name: string;
  deletedOn?: Date;
  deletedBy?: ObjectId;
  coachesIds: ObjectId[];
  billTo?: AddressData;
  shipTo?: AddressData;
  useBillTo?: boolean;
}

export type TeamDocument = (Document<unknown, unknown, TeamData> & TeamData) | null;

export interface TeamModel extends Model<TeamData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
  findTeamsCoachedByUser(
    coachId: ObjectId,
    projection?: ProjectionType<TeamData>
  ): Promise<TeamDocument[]>; // remove all docs from repo
}

const schema = new Schema<TeamData, TeamModel>({
  name: { type: Types.String, required: true },
  deletedOn: { type: Types.Date },
  deletedBy: { type: Types.ObjectId, ref: 'User' },
  coachesIds: [{ type: Types.ObjectId, ref: 'User', default: [] }],
  billTo: { type: addressSchema },
  shipTo: { type: addressSchema },
  useBillTo: { type: Types.Boolean, default: true },
});

schema.index({ name: 1 }, { unique: false });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

schema.static(
  'findTeamsCoachedByUser',
  function (coachId: ObjectId, projection?: ProjectionType<TeamData>) {
    return this.find({ coachesIds: coachId, deletedOn: null }, projection).exec();
  }
);

export const teamRepository = model<TeamData, TeamModel>('Team', schema);
