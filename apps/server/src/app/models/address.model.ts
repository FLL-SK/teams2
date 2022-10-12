import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';

export interface AddressData {
  _id?: ObjectId;
  name: string;
  street: string;
  city: string;
  zip: string;
  countryCode?: string;
  companyNumber?: string;
  vatNumber?: string;
  taxNumber?: string;
  contactName?: string;
  email?: string;
  phone?: string;
}

const Types = Schema.Types;

export const addressSchema = new Schema<AddressData>(
  {
    name: { type: Types.String, required: true },
    street: { type: Types.String, required: true },
    city: { type: Types.String, required: true },
    zip: { type: Types.String, required: true },
    countryCode: { type: Types.String },
    companyNumber: { type: Types.String },
    vatNumber: { type: Types.String },
    taxNumber: { type: Types.String },
    contactName: { type: Types.String },
    email: { type: Types.String },
    phone: { type: Types.String },
  },
  { collation: { locale: 'sk', strength: 1 }, _id: true }
);
