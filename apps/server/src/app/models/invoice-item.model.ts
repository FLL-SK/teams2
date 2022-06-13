import { Schema } from 'mongoose';

const Types = Schema.Types;

export interface InvoiceItemData {
  lineNo: number;
  text: string;
  note?: string;
  quantity: number;
  unitPrice: number;
}

export const invoiceItemSchema = new Schema<InvoiceItemData>(
  {
    lineNo: { type: Types.Number, required: true },
    text: { type: Types.String, required: true },
    note: { type: Types.String },
    quantity: { type: Types.Number, required: true },
    unitPrice: { type: Types.Number, required: true },
  },
  { _id: false }
);
