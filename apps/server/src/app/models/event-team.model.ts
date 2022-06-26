import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';

const Types = Schema.Types;

export interface EventTeamData {
  _id?: ObjectId;
  eventId: ObjectId;
  teamId: ObjectId;
  registeredOn: Date;
}

export type EventTeamDocument = (Document<unknown, unknown, EventTeamData> & EventTeamData) | null;

export interface EventTeamModel extends Model<EventTeamData> {
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<EventTeamData, EventTeamModel>({
  eventId: { type: Types.ObjectId, ref: 'Event', required: true },
  teamId: { type: Types.ObjectId, ref: 'Team', required: true },
  registeredOn: { type: Types.Date },
});

schema.index({ eventId: 1, teamId: 1 });
schema.index({ teamId: 1 });

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const eventTeamRepository = model<EventTeamData, EventTeamModel>('EventTeam', schema);
