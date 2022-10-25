import { Schema, model, Model, Document, FilterQuery } from 'mongoose';
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

  createdOn: Date;
  createdBy: ObjectId;
  confirmedOn?: Date;
  confirmedBy?: ObjectId;
  canceledOn?: Date;
  canceledBy?: ObjectId;

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
  countActiveRegistrations(eventId: ObjectId, teamId?: ObjectId): Promise<number>; //
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<RegistrationData, RegistrationModel>({
  programId: { type: Types.ObjectId, ref: 'Program', required: true },
  eventId: { type: Types.ObjectId, ref: 'Event', required: true },
  teamId: { type: Types.ObjectId, ref: 'Team', required: true },

  billTo: { type: addressSchema, required: true },
  shipTo: { type: addressSchema, required: true },

  createdOn: { type: Types.Date, required: true },
  createdBy: { type: Types.ObjectId, ref: 'User', required: true },

  confirmedOn: { type: Types.Date },
  confirmedBy: { type: Types.ObjectId, ref: 'User' },

  canceledOn: { type: Types.Date },
  canceledBy: { type: Types.ObjectId, ref: 'User' },

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
schema.index({ teamId: 1, createdOn: -1 });
schema.index({ programId: 1 });

schema.static('clean', function (): Promise<DeleteResult> {
  return this.deleteMany().exec();
});

schema.static(
  'countActiveRegistrations',
  function (eventId: ObjectId, teamId?: ObjectId): Promise<number> {
    const query: FilterQuery<RegistrationDocument> = { eventId, canceledOn: null };
    if (teamId) {
      query.teamId = teamId;
    }
    return this.count(query).exec();
  }
);

export const registrationRepository = model<RegistrationData, RegistrationModel>(
  'Registration',
  schema
);
