import { Schema } from 'mongoose';

export interface AddressData {
  name: string;
  street: string;
  city: string;
  zip: string;
  countryCode?: string;
  companyNumber?: string;
  vatNumber?: string;
  taxNumber?: string;
  contactName: string;
  email: string;
  phone: string;
}

const Types = Schema.Types;

export const schemaAddress = new Schema<AddressData>(
  {
    name: { type: Types.String, required: true },
    street: { type: Types.String, required: true },
    city: { type: Types.String, required: true },
    zip: { type: Types.String, required: true },
    countryCode: { type: Types.String },
    companyNumber: { type: Types.String },
    vatNumber: { type: Types.String },
    taxNumber: { type: Types.String },
    contactName: { type: Types.String, required: true },
    email: { type: Types.String, required: true },
    phone: { type: Types.String, required: true },
  },
  { _id: false }
);
