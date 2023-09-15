import { Schema, model, Model, Document, FilterQuery } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { AddressData, addressSchema } from './address.model';

const Types = Schema.Types;

export type RegistrtionType = 'NORMAL' | 'CLASS_PACK';

export interface RegistrationData {
  _id?: ObjectId;
  programId: ObjectId;
  eventId: ObjectId;
  teamId: ObjectId;

  billTo: AddressData;
  shipTo: AddressData;

  createdOn: Date;
  createdBy: ObjectId;
  confirmedOn?: Date;
  confirmedBy?: ObjectId;
  canceledOn?: Date;
  canceledBy?: ObjectId;

  invoiceIssuedOn?: Date;
  invoiceIssuedBy?: ObjectId;
  invoiceSentOn?: Date;
  invoiceRef?: string;
  invoiceNote?: string;

  paidOn?: Date;

  shipmentGroup?: string;
  shippedOn?: Date;

  girlCount?: number;
  boyCount?: number;
  coachCount?: number;
  sizeConfirmedOn?: Date;

  type: RegistrtionType;
  teamsImpacted: number;
  childrenImpacted: number;
}

export type RegistrationDocument =
  | (Document<unknown, unknown, RegistrationData> & RegistrationData)
  | null;

interface CountRegistrationsFilter {
  onlyNotInvoiced?: boolean;
  onlyNotShipped?: boolean;
  onlyUnconfirmed?: boolean;
  onlyUnpaid?: boolean;
  programId?: ObjectId;
  eventId?: ObjectId;
  teamId?: ObjectId;
  active?: boolean;
}

export interface RegistrationModel extends Model<RegistrationData> {
  countRegistrations(filter: CountRegistrationsFilter): Promise<number>; //
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<RegistrationData, RegistrationModel>({
  programId: { type: Types.ObjectId, ref: 'Program', required: true },
  eventId: { type: Types.ObjectId, ref: 'Event', required: true },
  teamId: { type: Types.ObjectId, ref: 'Team', required: true },

  billTo: { type: addressSchema, required: true },
  shipTo: { type: addressSchema, required: true },

  createdOn: { type: Types.Date, required: true },
  createdBy: { type: Types.ObjectId, ref: 'User', required: true },

  confirmedOn: { type: Types.Date },
  confirmedBy: { type: Types.ObjectId, ref: 'User' },

  canceledOn: { type: Types.Date },
  canceledBy: { type: Types.ObjectId, ref: 'User' },

  invoiceIssuedOn: { type: Types.Date },
  invoiceIssuedBy: { type: Types.ObjectId, ref: 'User' },
  invoiceSentOn: { type: Types.Date },
  invoiceRef: { type: Types.String },
  invoiceNote: { type: Types.String },

  paidOn: { type: Types.Date },

  shipmentGroup: { type: Types.String },
  shippedOn: { type: Types.Date },

  girlCount: { type: Types.Number, default: 0 },
  boyCount: { type: Types.Number, default: 0 },
  coachCount: { type: Types.Number, default: 0 },
  sizeConfirmedOn: { type: Types.Date },

  type: { type: Types.String, enum: ['NORMAL', 'CLASS_PACK'], required: true },
  teamsImpacted: { type: Types.Number, default: 0 },
  childrenImpacted: { type: Types.Number, default: 0 },
});

schema.index({ eventId: 1, teamId: 1 });
schema.index({ teamId: 1, createdOn: -1 });
schema.index({ programId: 1 });

schema.static('clean', function (): Promise<DeleteResult> {
  return this.deleteMany().exec();
});

schema.static(
  'countRegistrations',
  async function getRegistrationsCount(filter: CountRegistrationsFilter): Promise<number> {
    const q: FilterQuery<RegistrationData> = {};
    if (typeof filter.active === 'boolean') {
      if (filter.active) {
        q.canceledOn = null;
      } else {
        q.canceledOn = { $ne: null };
      }
    } else {
      q.canceledOn = null;
    }

    if (filter.programId) {
      q.programId = filter.programId;
    }
    if (filter.onlyUnconfirmed) {
      q.confirmedOn = null;
    }
    if (filter.onlyUnpaid) {
      q.paidOn = null;
      q.invoiceIssuedOn = { $ne: null };
    }
    if (filter.onlyNotInvoiced) {
      q.invoiceIssuedOn = null;
      q.confirmedOn = { $ne: null };
    }
    if (filter.onlyNotShipped) {
      q.shippedOn = null;
      q.confirmedOn = { $ne: null };
    }
    if (filter.eventId) {
      q.eventId = filter.eventId;
    }
    if (filter.teamId) {
      q.teamId = filter.teamId;
    }

    const regsCount = await registrationRepository
      .aggregate([
        {
          $match: q,
        },
        {
          $group: {
            _id: '$teamId',
          },
        },
        {
          $count: 'count',
        },
      ])
      .exec();
    return regsCount[0]?.count ?? 0;
  },
);

export const registrationRepository = model<RegistrationData, RegistrationModel>(
  'Registration',
  schema,
);
