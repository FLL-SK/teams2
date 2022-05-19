import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';

const Types = Schema.Types;

export interface UserData {
  _id?: ObjectId;
  username: string;
  name?: string;
  phoneNumber?: string;
  deletedOn?: Date;
}

export type UserDocument = (Document<unknown, unknown, UserData> & UserData) | null;

export interface UserModel extends Model<UserData> {
  findByUsername(username: string | ObjectId): Promise<UserDocument | null>;
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<UserData, UserModel>({
  username: { type: Types.String, required: true },
  name: Types.String,
  phoneNumber: Types.String,
  deletedOn: Types.Date,
});

schema.index({ username: 1 }, { unique: true });

schema.static('findByUsername', function (username: string) {
  return this.findOne({ username }).exec();
});

schema.static('clean', function () {
  return this.deleteMany().exec();
});

export const userRepository = model<UserData, UserModel>('User', schema);
