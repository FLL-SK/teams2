import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { AddressData, addressSchema } from './address.model';

const Types = Schema.Types;

export interface RegistrationData {
  _id?: ObjectId;
  programId: ObjectId;
  eventId: ObjectId;
  teamId: ObjectId;

  billTo: AddressData;
  shipTo: AddressData;

  registeredOn: Date;
  registeredBy: ObjectId;

  invoiceIssuedOn?: Date;
  invoiceIssuedBy?: ObjectId;
  invoiceSentOn?: Date;
  invoiceRef?: string;
  invoiceNote?: string;

  paidOn?: Date;

  shipmentGroup?: string;
  shippedOn?: Date;

  girlCount?: number;
  boyCount?: number;
  coachCount?: number;
  sizeConfirmedOn?: Date;
}

export type RegistrationDocument =
  | (Document<unknown, unknown, RegistrationData> & RegistrationData)
  | null;

export interface RegistrationModel extends Model<RegistrationData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<RegistrationData, RegistrationModel>({
  programId: { type: Types.ObjectId, ref: 'Program', required: true },
  eventId: { type: Types.ObjectId, ref: 'Event', required: true },
  teamId: { type: Types.ObjectId, ref: 'Team', required: true },

  billTo: { type: addressSchema, required: true },
  shipTo: { type: addressSchema, required: true },

  registeredOn: { type: Types.Date, required: true },
  registeredBy: { type: Types.ObjectId, ref: 'User', required: true },

  invoiceIssuedOn: { type: Types.Date },
  invoiceIssuedBy: { type: Types.ObjectId, ref: 'User' },
  invoiceSentOn: { type: Types.Date },
  invoiceRef: { type: Types.String },
  invoiceNote: { type: Types.String },

  paidOn: { type: Types.Date },

  shipmentGroup: { type: Types.String },
  shippedOn: { type: Types.Date },

  girlCount: { type: Types.Number, default: 0 },
  boyCount: { type: Types.Number, default: 0 },
  coachCount: { type: Types.Number, default: 0 },
  sizeConfirmedOn: { type: Types.Date },
});

schema.index({ eventId: 1, teamId: 1 });
schema.index({ teamId: 1 });
schema.index({ programId: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const registrationRepository = model<RegistrationData, RegistrationModel>(
  'Registration',
  schema
);
