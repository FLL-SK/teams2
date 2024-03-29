import { Schema, Model, Document, model } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';

const Types = Schema.Types;

export interface InvoiceItemData {
  _id?: ObjectId;
  programId?: ObjectId;
  eventId?: ObjectId;
  registrationId?: ObjectId;

  lineNo?: number;
  text: string;
  note?: string;
  quantity: number;
  unitPrice: number;

  public?: boolean;
}

export type InvoiceItemDocument =
  | (Document<unknown, unknown, InvoiceItemData> & InvoiceItemData)
  | null;

export interface InvoiceItemModel extends Model<InvoiceItemData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<InvoiceItemData>({
  programId: { type: Types.ObjectId, ref: 'Program' },
  eventId: { type: Types.ObjectId, ref: 'Event' },
  registrationId: { type: Types.ObjectId, ref: 'Registration' },
  lineNo: { type: Types.Number },
  text: { type: Types.String, required: true },
  note: { type: Types.String },
  quantity: { type: Types.Number, required: true },
  unitPrice: { type: Types.Number, required: true },
  public: { type: Types.Boolean },
});

schema.index({ programId: 1 });
schema.index({ eventId: 1 });
schema.index({ registrationId: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const invoiceItemRepository = model<InvoiceItemData, InvoiceItemModel>(
  'InvoiceItem',
  schema,
);
