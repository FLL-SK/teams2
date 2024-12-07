import { ObjectId } from 'mongodb';
import { Schema } from 'mongoose';

export interface PricelistEntryData {
  _id?: ObjectId;
  /** enry name */
  n: string;
  /** unit price */
  up: number;
  /** unit */
  u?: string;
}

const Types = Schema.Types;

export const pricelistEntrySchema = new Schema<PricelistEntryData>(
  {
    n: { type: Types.String, required: true },
    up: { type: Types.Number, required: true },
    u: Types.String,
  },
  { collation: { locale: 'sk', strength: 1 }, _id: true },
);
