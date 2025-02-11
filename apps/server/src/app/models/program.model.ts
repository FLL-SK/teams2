import { Schema, model, Model, Document, ProjectionType, FilterQuery } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';

const Types = Schema.Types;

export interface ProgramData {
  _id?: ObjectId;
  name: string;
  description?: string;
  logoUrl?: string;
  color?: string;
  conditions?: string;
  startDate: Date;
  endDate: Date;
  maxTeams?: number;
  maxTeamSize?: number;
  /** Team registration sequence. Will be increased with every team registration */
  teamRegSequence: number;
  group?: string;

  managersIds: ObjectId[];

  deletedOn?: Date;
  deletedBy?: ObjectId;

  classPackEnabled?: boolean;
}

export type ProgramDocument = (Document<unknown, unknown, ProgramData> & ProgramData) | null;

interface ProgramFilter {
  isActive?: boolean;
}

export interface ProgramModel extends Model<ProgramData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
  findProgramsManagedByUser(
    userId: ObjectId,
    projection?: ProjectionType<ProgramData>,
  ): Promise<ProgramDocument[]>;
  findPrograms(
    filter: ProgramFilter,
    projection?: ProjectionType<ProgramData>,
  ): Promise<ProgramDocument[]>;
  incrementTeamRegSequence(programId: ObjectId): Promise<number>;
}

const schema = new Schema<ProgramData, ProgramModel>(
  {
    name: { type: Types.String, required: true },
    description: { type: Types.String },
    logoUrl: { type: Types.String },
    color: { type: Types.String },
    conditions: { type: Types.String },
    teamRegSequence: { type: Types.Number, default: 1 },
    maxTeams: { type: Types.Number },
    maxTeamSize: { type: Types.Number },
    managersIds: [{ type: Types.ObjectId, ref: 'User', default: [] }],
    group: { type: Types.String },

    classPackEnabled: { type: Types.Boolean, default: false },

    startDate: { type: Types.Date, required: true },
    endDate: { type: Types.Date, required: true },

    deletedOn: { type: Types.Date },
    deletedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { collation: { locale: 'sk', strength: 1 } },
);

schema.index({ name: 1 }, { unique: true });
schema.index({ managersIds: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

schema.static('incrementTeamRegSequence', async function (programId: ObjectId) {
  const program = await this.findOneAndUpdate(
    { _id: programId },
    { $inc: { teamRegSequence: 1 } },
    { new: true },
  ).exec();
  if (!program) {
    throw new Error(`Program not found: ${programId}`);
  }

  return program.teamRegSequence;
});

schema.static(
  'findProgramsManagedByUser',
  function (userId: ObjectId, projection?: ProjectionType<ProgramData>) {
    return this.find({ managersIds: userId, deletedOn: null }, projection).exec();
  },
);

schema.static(
  'findPrograms',
  function (filter: ProgramFilter, projection?: ProjectionType<ProgramData>) {
    let q: FilterQuery<ProgramData> = {};
    if (filter.isActive) {
      q = { ...q, startDate: { $lt: new Date() }, endDate: { $gte: new Date() }, deletedOn: null };
    }
    return this.find(q, projection).sort({ group: 1, startDate: -1 }).exec();
  },
);

export const programRepository = model<ProgramData, ProgramModel>('Program', schema);
