import { Schema, model, Model, Document, ProjectionType } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';

const Types = Schema.Types;

export interface EventData {
  _id?: ObjectId;
  name?: string;
  teamsIds: ObjectId[];
  managersIds: ObjectId[];
  date?: Date;
  registrationStart?: Date;
  registrationEnd?: Date;

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
}

const schema = new Schema<EventData, EventModel>({
  name: { type: Types.String, required: true },
  teamsIds: [{ type: Types.ObjectId, ref: 'Team', default: [] }],
  managersIds: [{ type: Types.ObjectId, ref: 'User', default: [] }],
  registrationStart: { type: Types.Date, default: new Date() },
  registrationEnd: { type: Types.Date },

  deletedOn: { type: Types.Date },
  deletedBy: { type: Types.ObjectId, ref: 'User' },
});

schema.index({ name: 1 }, { unique: true });
schema.index({ teamIds: 1 });
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

export const eventRepository = model<EventData, EventModel>('Event', schema);
