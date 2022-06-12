import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';

const Types = Schema.Types;

export interface InvoiceItemData {
  lineNo: number;
  item: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  _id?: ObjectId;
  number?: string;
  issuedOn: Date;
  teamId: ObjectId;

  items: InvoiceItemData[];
}

export type InvoiceDocument = (Document<unknown, unknown, InvoiceData> & InvoiceData) | null;

export interface InvoiceModel extends Model<InvoiceData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schemaItems = new Schema<InvoiceItemData>(
  {
    lineNo: { type: Types.Number, required: true },
    item: { type: Types.String, required: true },
    description: { type: Types.String },
    quantity: { type: Types.Number, required: true },
    unitPrice: { type: Types.Number, required: true },
  },
  { _id: false }
);

const schema = new Schema<InvoiceData, InvoiceModel>({
  number: { type: Types.String, required: true },
  issuedOn: { type: Types.Date, required: true },
  teamId: { type: Types.ObjectId, ref: 'Team', required: true },

  items: [{ type: schemaItems, default: [] }],
});

schema.index({ number: 1 });
schema.index({ teamId: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const invoiceRepository = model<InvoiceData, InvoiceModel>('Invoice', schema);
