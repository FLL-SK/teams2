import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';

const Types = Schema.Types;

export interface InvoiceData {
  _id?: ObjectId;
  number: string;
  companyNumber?: string;
  issuedOn: Date;
  total: number;

  teamId?: ObjectId;
  eventId?: ObjectId;

  paidOn?: Date;
  sentOn?: Date;

  token?: string;
}

export type InvoiceDocument = (Document<unknown, unknown, InvoiceData> & InvoiceData) | null;

export interface InvoiceModel extends Model<InvoiceData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<InvoiceData, InvoiceModel>({
  number: { type: Types.String, required: true },
  companyNumber: { type: Types.String },
  issuedOn: { type: Types.Date, required: true },
  total: { type: Types.Number, required: true },

  teamId: { type: Types.ObjectId, ref: 'Team' },
  eventId: { type: Types.ObjectId, ref: 'Event' },

  paidOn: { type: Types.Date },
  sentOn: { type: Types.Date },
  token: { type: Types.String },
});

schema.index({ number: 1 });
schema.index({ teamId: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const invoiceRepository = model<InvoiceData, InvoiceModel>('Invoice', schema);
