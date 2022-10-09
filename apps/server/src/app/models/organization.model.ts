import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { OrganizationType } from '../generated/graphql';

const Types = Schema.Types;

export interface OrganizationData {
  _id?: ObjectId;
  name: string;

  type: OrganizationType;

  streetAddr: string;
  city: string;
  postCode: string;
  countryCode?: string;

  companyNumber?: string;
  vatNumber?: string;
  taxNumber?: string;

  websiteUrl?: string;
  email?: string;
  phone?: string;

  tagIds: ObjectId[];

  createdOn: Date;
  deletedOn?: Date;
  deletedBy?: ObjectId;
}

export type OrganizationDocument =
  | (Document<unknown, unknown, OrganizationData> & OrganizationData)
  | null;

export interface OrganizationModel extends Model<OrganizationData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<OrganizationData, OrganizationModel>(
  {
    name: { type: Types.String, required: true },

    type: { type: Types.String, required: true },

    streetAddr: { type: Types.String, required: true },
    city: { type: Types.String, required: true },
    postCode: { type: Types.String, required: true },
    countryCode: { type: Types.String },

    companyNumber: { type: Types.String },
    vatNumber: { type: Types.String },
    taxNumber: { type: Types.String },

    websiteUrl: { type: Types.String },
    email: { type: Types.String },
    phone: { type: Types.String },

    tagIds: [{ type: Types.ObjectId, ref: 'Tag', default: [] }],

    createdOn: { type: Types.Date, default: Date.now() },
    deletedOn: { type: Types.Date },
    deletedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { collation: { locale: 'sk', strength: 1 } }
);

schema.index({ name: 1 }, { unique: false });
schema.index({ tagIds: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const orgRepository = model<OrganizationData, OrganizationModel>('Organization', schema);
