import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';

const Types = Schema.Types;

export interface RegistrationData {
  _id?: ObjectId;
  programId: ObjectId;
  eventId: ObjectId;
  teamId: ObjectId;

  registeredOn: Date;
  registeredBy: ObjectId;

  invoiceIssuedOn?: Date;
  invoiceIssuedBy?: ObjectId;

  paidOn?: Date;

  shipmentGroup?: string;
  shippedOn?: Date;

  teamSize?: number;
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

  registeredOn: { type: Types.Date, required: true },
  registeredBy: { type: Types.ObjectId, ref: 'User', required: true },
  invoiceIssuedOn: { type: Types.Date },
  invoiceIssuedBy: { type: Types.ObjectId, ref: 'User' },
  paidOn: { type: Types.Date },
  shipmentGroup: { type: Types.String },
  shippedOn: { type: Types.Date },

  teamSize: { type: Types.Number, default: 0 },
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
