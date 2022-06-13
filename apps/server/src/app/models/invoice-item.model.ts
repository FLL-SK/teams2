import { Schema } from 'mongoose';

const Types = Schema.Types;

export interface InvoiceItemData {
  lineNo: number;
  item: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export const invoiceItemSchema = new Schema<InvoiceItemData>(
  {
    lineNo: { type: Types.Number, required: true },
    item: { type: Types.String, required: true },
    description: { type: Types.String },
    quantity: { type: Types.Number, required: true },
    unitPrice: { type: Types.Number, required: true },
  },
  { _id: false }
);
