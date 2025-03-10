import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';
import { AddressData, addressSchema } from './address.model';

export interface OrderData {
  _id?: ObjectId;
  createdOn: Date;
  updatedOn?: Date;
  invoicedOn?: Date;
  invoiceRef?: string;
  sentOn?: Date;
  note?: string;
  billTo: AddressData;
  shipTo?: AddressData;
  items: {
    _id?: ObjectId;
    productId: ObjectId;
    name: string;
    quantity: number;
    unitPrice: number;
    /** total price for quantity of this item */
    price: number;
  }[];
}

const Types = Schema.Types;

export const orderSchema = new Schema<OrderData>(
  {
    createdOn: { type: Types.Date, required: true },
    updatedOn: { type: Types.Date },
    invoicedOn: { type: Types.Date },
    invoiceRef: { type: Types.String },
    sentOn: { type: Types.Date },
    billTo: { type: addressSchema, required: true },
    shipTo: { type: addressSchema, required: false },
    note: { type: Types.String },
    items: [
      {
        productId: { type: Types.ObjectId, required: true },
        name: { type: Types.String, required: true },
        quantity: { type: Types.Number, required: true },
        unitPrice: { type: Types.Number, required: true },
        price: { type: Types.Number, required: true },
      },
    ],
  },
  { collation: { locale: 'sk', strength: 1 }, _id: true },
);
