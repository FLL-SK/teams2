import { Schema, model, Model, Document, ProjectionType, Aggregate } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { PricelistEntryData } from './pricelist.model';

const Types = Schema.Types;

export interface EventData {
  _id?: ObjectId;
  name?: string;
  programId: ObjectId;
  conditions?: string;
  ownFeesAllowed?: boolean;
  maxTeams?: number;

  invitationOnly?: boolean;
  invitedTeamsIds?: ObjectId[];

  managersIds: ObjectId[];

  date?: Date;
  registrationEnd?: Date;

  foodOrderDeadline?: Date;
  foodOrderEnabled?: boolean;
  foodTypes: PricelistEntryData[];

  deletedOn?: Date;
  deletedBy?: ObjectId;

  archivedOn?: Date;
  archivedBy?: ObjectId;
}

export type EventDocument = (Document<unknown, unknown, EventData> & EventData) | null;

export interface EventModel extends Model<EventData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
  findEventsManagedByUser(
    userId: ObjectId,
    projection?: ProjectionType<EventData>,
  ): Promise<EventDocument[]>;
  findEventsForProgram(
    programId: ObjectId,
    projection?: ProjectionType<EventData>,
  ): Promise<EventDocument[]>;
  archiveEvent(eventId: ObjectId, userId: ObjectId): Promise<EventDocument>;
  deleteEvent(eventId: ObjectId, userId: ObjectId): Promise<EventDocument>;
  undeleteEvent(eventId: ObjectId, userId: ObjectId): Promise<EventDocument>;
  unarchiveEvent(eventId: ObjectId, userId: ObjectId): Promise<EventDocument>;
  toggleFoodOrderEnabled(
    eventId: ObjectId,
    userId: ObjectId,
    enable?: boolean,
  ): Promise<EventDocument>;
}

const schema = new Schema<EventData, EventModel>(
  {
    name: { type: Types.String, required: true },
    programId: { type: Types.ObjectId, ref: 'Program', required: true },
    conditions: { type: Types.String },
    ownFeesAllowed: { type: Types.Boolean },
    maxTeams: { type: Types.Number },

    invitationOnly: { type: Types.Boolean },
    invitedTeamsIds: [{ type: Types.ObjectId, ref: 'Team', default: [] }],

    date: { type: Types.Date },
    registrationEnd: { type: Types.Date },

    foodOrderDeadline: { type: Types.Date },
    foodOrderEnabled: { type: Types.Boolean },
    foodTypes: [
      {
        n: { type: Types.String, required: true },
        up: { type: Types.Number, required: true },
      },
    ],

    managersIds: [{ type: Types.ObjectId, ref: 'User', default: [] }],

    deletedOn: { type: Types.Date },
    deletedBy: { type: Types.ObjectId, ref: 'User' },

    archivedOn: { type: Types.Date },
    archivedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { collation: { locale: 'sk', strength: 1 } },
);

schema.index({ programId: 1, name: 1 }, { unique: true });
schema.index({ managersIds: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

schema.static(
  'findEventsManagedByUser',
  function (userId: ObjectId, projection?: ProjectionType<EventData>) {
    return this.find({ managersIds: userId, deletedOn: null }, projection).exec();
  },
);

schema.static(
  'findEventsForProgram',
  function (programId: ObjectId, projection?: ProjectionType<EventData>) {
    return this.find({ programId, deletedOn: null }, projection).exec();
  },
);

schema.static('archiveEvent', function (eventId: ObjectId, userId: ObjectId) {
  const u: Partial<EventData> = { archivedOn: new Date(), archivedBy: userId };
  return this.findByIdAndUpdate(eventId, u, { new: true }).exec();
});

schema.static('deleteEvent', function (eventId: ObjectId, userId: ObjectId) {
  const u: Partial<EventData> = { deletedOn: new Date(), deletedBy: userId };
  return this.findByIdAndUpdate(eventId, u, { new: true }).exec();
});

schema.static('undeleteEvent', function (eventId: ObjectId, userId: ObjectId) {
  const u: Partial<EventData> = { deletedOn: null, deletedBy: null };
  return this.findByIdAndUpdate(eventId, u, { new: true }).exec();
});

schema.static('unarchiveEvent', function (eventId: ObjectId, userId: ObjectId) {
  const u: Partial<EventData> = { archivedOn: null, archivedBy: null };
  return this.findByIdAndUpdate(eventId, u, { new: true }).exec();
});

schema.static(
  'toggleFoodOrderEnabled',
  function (eventId: ObjectId, userId: ObjectId, enable?: boolean) {
    const v =
      typeof enable === 'boolean'
        ? enable
        : {
            $not: '$present',
          };
    const u = [
      {
        $set: {
          foodOrderEnabled: v,
        },
      },
    ];

    console.log('togle', eventId, u, v);

    return this.findByIdAndUpdate(eventId, u, { new: true }).exec();
  },
);

export const eventRepository = model<EventData, EventModel>('Event', schema);
