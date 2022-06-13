import { Schema, model, Model, Document, ProjectionType, FilterQuery } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';

const Types = Schema.Types;

export interface ProgramData {
  _id?: ObjectId;
  name: string;
  description?: string;
  logoUrl?: string;

  managersIds: ObjectId[];

  deletedOn?: Date;
  deletedBy?: ObjectId;
}

export type ProgramDocument = (Document<unknown, unknown, ProgramData> & ProgramData) | null;

interface ProgramFilter {
  isActive?: boolean;
}

export interface ProgramModel extends Model<ProgramData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
  findProgramsManagedByUser(
    userId: ObjectId,
    projection?: ProjectionType<ProgramData>
  ): Promise<ProgramDocument[]>;
  findPrograms(
    filter: ProgramFilter,
    projection?: ProjectionType<ProgramData>
  ): Promise<ProgramDocument[]>;
}

const schema = new Schema<ProgramData, ProgramModel>({
  name: { type: Types.String, required: true },
  description: Types.String,
  logoUrl: Types.String,
  managersIds: [{ type: Types.ObjectId, ref: 'User', default: [] }],

  deletedOn: { type: Types.Date },
  deletedBy: { type: Types.ObjectId, ref: 'User' },
});

schema.index({ name: 1 }, { unique: true });
schema.index({ managersIds: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

schema.static(
  'findProgramsManagedByUser',
  function (userId: ObjectId, projection?: ProjectionType<ProgramData>) {
    return this.find({ managersIds: userId, deletedOn: null }, projection).exec();
  }
);

schema.static(
  'findPrograms',
  function (filter: ProgramFilter, projection?: ProjectionType<ProgramData>) {
    let q: FilterQuery<ProgramData> = {};
    if (filter.isActive) {
      q = { ...q, startDate: { $lt: new Date() }, endDate: { $gte: new Date() }, deletedOn: null };
    }
    return this.find(q, projection).exec();
  }
);

export const programRepository = model<ProgramData, ProgramModel>('Program', schema);
