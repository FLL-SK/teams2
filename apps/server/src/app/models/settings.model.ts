import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { AddressData, addressSchema } from './address.model';

const Types = Schema.Types;

export interface SettingsData {
  _id?: ObjectId;
  appLogoUrl?: string;
  organization: AddressData;
  sysEmail?: string; // email for system messages e.g. new signup
  billingEmail?: string; // email for billing related messages
  emailFrom?: string; // email from which the system sends emails
  privacyPolicyUrl?: string;
}

export type SettingsDocument = (Document<unknown, unknown, SettingsData> & SettingsData) | null;

export interface SettingsModel extends Model<SettingsData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
  get(): Promise<SettingsDocument>;
  put(data: Partial<SettingsData>): Promise<SettingsDocument>;
}

const schema = new Schema<SettingsData, SettingsModel>({
  appLogoUrl: { type: Types.String },
  organization: { type: addressSchema, required: true },
  sysEmail: { type: Types.String },
  billingEmail: { type: Types.String },
  emailFrom: { type: Types.String },
  privacyPolicyUrl: { type: Types.String },
});

schema.static('clean', function () {
  return this.deleteMany().exec();
});

schema.static('get', function () {
  return this.findOne({}).exec();
});

schema.static('put', function (data: Partial<SettingsData>) {
  return this.findOneAndUpdate({}, data, { new: true }).exec();
});

export const settingsRepository = model<SettingsData, SettingsModel>('Setting', schema);
