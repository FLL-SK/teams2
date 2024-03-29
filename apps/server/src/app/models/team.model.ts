import { Schema, model, Model, Document, ProjectionType } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { AddressData, addressSchema } from './address.model';

const Types = Schema.Types;

export interface TeamData {
  _id?: ObjectId;
  name: string;
  coachesIds: ObjectId[];
  tagIds: ObjectId[];
  address: AddressData;
  billTo?: AddressData;
  shipTo?: AddressData;
  useBillTo?: boolean;
  createdOn: Date;
  deletedOn?: Date;
  deletedBy?: ObjectId;
}

export type TeamDocument = (Document<unknown, unknown, TeamData> & TeamData) | null;

export interface TeamModel extends Model<TeamData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
  findTeamsCoachedByUser(
    coachId: ObjectId,
    projection?: ProjectionType<TeamData>,
  ): Promise<TeamDocument[]>; // remove all docs from repo
}

const schema = new Schema<TeamData, TeamModel>(
  {
    name: { type: Types.String, required: true },
    createdOn: { type: Types.Date, default: Date.now() },
    deletedOn: { type: Types.Date },
    deletedBy: { type: Types.ObjectId, ref: 'User' },
    coachesIds: [{ type: Types.ObjectId, ref: 'User', default: [] }],
    tagIds: [{ type: Types.ObjectId, ref: 'Tag', default: [] }],
    address: { type: addressSchema },
    billTo: { type: addressSchema },
    shipTo: { type: addressSchema },
    useBillTo: { type: Types.Boolean, default: true },
  },
  { collation: { locale: 'sk', strength: 1 } },
);

schema.index({ name: 1 }, { unique: false });
schema.index({ coachesIds: 1 });
schema.index({ tagIds: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

schema.static(
  'findTeamsCoachedByUser',
  function (coachId: ObjectId, projection?: ProjectionType<TeamData>) {
    return this.find({ coachesIds: coachId, deletedOn: null }, projection).exec();
  },
);

export const teamRepository = model<TeamData, TeamModel>('Team', schema);
