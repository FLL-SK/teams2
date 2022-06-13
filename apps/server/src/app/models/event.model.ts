import { Schema, model, Model, Document, ProjectionType } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { InvoiceItemData, invoiceItemSchema } from '.';

const Types = Schema.Types;

export interface EventData {
  _id?: ObjectId;
  name?: string;
  programId: ObjectId;

  teamsIds: ObjectId[];
  managersIds: ObjectId[];

  date?: Date;
  registrationEnd?: Date;

  invoiceItems?: InvoiceItemData[];

  deletedOn?: Date;
  deletedBy?: ObjectId;
}

export type EventDocument = (Document<unknown, unknown, EventData> & EventData) | null;

export interface EventModel extends Model<EventData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
  findEventsManagedByUser(
    userId: ObjectId,
    projection?: ProjectionType<EventData>
  ): Promise<EventDocument[]>;
  findEventsForProgram(
    programId: ObjectId,
    projection?: ProjectionType<EventData>
  ): Promise<EventDocument[]>;
}

const schema = new Schema<EventData, EventModel>({
  name: { type: Types.String, required: true },
  programId: { type: Types.ObjectId, ref: 'Program', required: true },

  date: { type: Types.Date },
  registrationEnd: { type: Types.Date },

  teamsIds: [{ type: Types.ObjectId, ref: 'Team', default: [] }],
  managersIds: [{ type: Types.ObjectId, ref: 'User', default: [] }],

  invoiceItems: { type: [invoiceItemSchema], default: [] },

  deletedOn: { type: Types.Date },
  deletedBy: { type: Types.ObjectId, ref: 'User' },
});

schema.index({ programId: 1, name: 1 }, { unique: true });
schema.index({ managersIds: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

schema.static(
  'findEventsManagedByUser',
  function (userId: ObjectId, projection?: ProjectionType<EventData>) {
    return this.find({ managersIds: userId, deletedOn: null }, projection).exec();
  }
);

schema.static(
  'findEventsForProgram',
  function (programId: ObjectId, projection?: ProjectionType<EventData>) {
    return this.find({ programId, deletedOn: null }, projection).exec();
  }
);

export const eventRepository = model<EventData, EventModel>('Event', schema);
