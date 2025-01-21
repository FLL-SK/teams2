import { Schema, model, Model, Document, FilterQuery } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { AddressData, addressSchema } from './address.model';
import { OrderData, orderSchema } from './order.model';

const Types = Schema.Types;

export type RegistrationType = 'NORMAL' | 'CLASS_PACK';

export interface RegistrationData {
  _id?: ObjectId;
  programId: ObjectId;
  eventId?: ObjectId;
  teamId: ObjectId;
  teamNo?: string;

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

  type: RegistrationType;
  teamsImpacted: number;
  childrenImpacted?: number;
  setCount: number;

  foodOrder?: OrderData;
}

export type RegistrationDocument =
  | (Document<unknown, unknown, RegistrationData> & RegistrationData)
  | null;

interface CountRegistrationsFilter {
  onlyNotInvoiced?: boolean;
  onlyNotShipped?: boolean;
  onlyUnconfirmed?: boolean;
  onlyUnpaid?: boolean;
  onlyProgramRelated?: boolean;
  programId?: ObjectId;
  eventId?: ObjectId;
  teamId?: ObjectId;
  active?: boolean;
}

export interface RegistrationModel extends Model<RegistrationData> {
  groupRegistrations(filter: CountRegistrationsFilter): Promise<RegistrationGroup[]>; //
  getEventRegistrations(
    eventId: ObjectId,
    options: {
      active?: boolean;
      confirmed?: boolean;
      canceled?: boolean;
      unpaid?: boolean;
      invoiced?: boolean;
      shipped?: boolean;
      havingFoodOrder?: boolean;
      notHavingFoodOrder?: boolean;
    },
  ): Promise<RegistrationData[]>; // get all registrations for event
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<RegistrationData, RegistrationModel>({
  programId: { type: Types.ObjectId, ref: 'Program', required: true },
  eventId: { type: Types.ObjectId, ref: 'Event' },
  teamId: { type: Types.ObjectId, ref: 'Team', required: true },
  teamNo: { type: Types.String, required: false },

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
  teamsImpacted: { type: Types.Number, required: true },
  childrenImpacted: { type: Types.Number },
  setCount: { type: Types.Number, default: 1 },

  foodOrder: orderSchema,
});

schema.index({ eventId: 1, teamId: 1 });
schema.index({ teamId: 1, createdOn: -1 });
schema.index({ programId: 1 });

schema.static('clean', function (): Promise<DeleteResult> {
  return this.deleteMany().exec();
});

export interface RegistrationGroup {
  _id: ObjectId;
  setCount: number;
  teamCount: number;
  childrenCount: number;
}

schema.static('groupRegistrations', async function (filter: CountRegistrationsFilter): Promise<
  RegistrationGroup[]
> {
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
  } else {
    q.confirmedOn = { $ne: null };
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
  if (filter.onlyProgramRelated) {
    q.eventId = null;
  }

  if (filter.teamId) {
    q.teamId = filter.teamId;
  }

  const regs = await registrationRepository
    .aggregate<RegistrationGroup>([
      {
        $match: q,
      },
      {
        $group: {
          _id: '$teamId',
          setCount: { $sum: '$setCount' },
          teamCount: { $sum: '$teamsImpacted' },
          childrenCount: { $sum: '$childrenImpacted' },
        },
      },
    ])
    .exec();

  return regs;
});

schema.static(
  'getEventRegistrations',
  function (
    eventId: ObjectId,
    options: {
      active?: boolean;
      confirmed?: boolean;
      canceled?: boolean;
      unpaid?: boolean;
      invoiced?: boolean;
      shipped?: boolean;
      havingFoodOrder?: boolean;
      notHavingFoodOrder?: boolean;
    },
  ): Promise<RegistrationData[]> {
    const q: FilterQuery<RegistrationData> = { eventId };
    if (options.confirmed) {
      q.confirmedOn = { $ne: null };
    }
    if (options.active) {
      q.canceledOn = null;
    }
    if (options.canceled) {
      q.canceledOn = { $ne: null };
    }
    if (options.unpaid) {
      q.paidOn = null;
    }
    if (options.invoiced) {
      q.invoiceIssuedOn = { $ne: null };
    }
    if (options.shipped) {
      q.shippedOn = { $ne: null };
    }
    if (options.havingFoodOrder) {
      q['foodOrder.items'] = { $exists: true, $ne: [] };
    }
    if (options.notHavingFoodOrder) {
      q['foodOrder.items'] = { $exists: false };
    }
    return this.find(q).exec();
  },
);

export const registrationRepository = model<RegistrationData, RegistrationModel>(
  'Registration',
  schema,
);
