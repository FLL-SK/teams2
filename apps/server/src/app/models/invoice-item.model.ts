import { Schema, Model, Document, model } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';

const Types = Schema.Types;

export interface InvoiceItemData {
  _id?: ObjectId;
  invoiceId?: ObjectId;
  programId?: ObjectId;
  eventId?: ObjectId;

  lineNo?: number;
  text: string;
  note?: string;
  quantity: number;
  unitPrice: number;
}

export type InvoiceItemDocument =
  | (Document<unknown, unknown, InvoiceItemData> & InvoiceItemData)
  | null;

export interface InvoiceItemModel extends Model<InvoiceItemData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<InvoiceItemData>({
  invoiceId: { type: Types.ObjectId },
  programId: { type: Types.ObjectId },
  eventId: { type: Types.ObjectId },
  lineNo: { type: Types.Number },
  text: { type: Types.String, required: true },
  note: { type: Types.String },
  quantity: { type: Types.Number, required: true },
  unitPrice: { type: Types.Number, required: true },
});

schema.index({ invoiceId: 1 });
schema.index({ programId: 1 });
schema.index({ eventId: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const invoiceItemRepository = model<InvoiceItemData, InvoiceItemModel>(
  'InvoiceItem',
  schema
);
