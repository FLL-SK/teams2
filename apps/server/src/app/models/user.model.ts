import { Schema, model, Model, Document } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { hashPassword } from '../utils/hash-password';

const Types = Schema.Types;

export interface UserData {
  _id?: ObjectId;
  name?: string; // deprecated
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdOn: Date;
  deletedOn?: Date;
  deletedBy?: ObjectId;
  password: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  lastLoginOn?: Date;
  gdprAcceptedOn?: Date;
  gdprDeclinedOn?: Date;
}

export type UserDataNoPassword = Omit<UserData, 'password'>;

export type UserDocument = (Document<unknown, unknown, UserData> & UserData) | null;

export interface UserModel extends Model<UserData> {
  findByUsername(username: string): Promise<UserDocument | null>;
  findActiveByUsername(username: string): Promise<UserDocument | null>;
  clean(): Promise<DeleteResult>; // remove all docs from repo
}

const schema = new Schema<UserData, UserModel>(
  {
    username: { type: Types.String, required: true },
    firstName: { type: Types.String },
    lastName: { type: Types.String },
    password: { type: Types.String, required: true }, // hashed password
    phone: { type: Types.String },
    createdOn: { type: Types.Date, default: new Date() },
    deletedOn: { type: Types.Date },
    deletedBy: { type: Types.ObjectId, ref: 'User' },
    isAdmin: { type: Types.Boolean },
    isSuperAdmin: { type: Types.Boolean },
    lastLoginOn: { type: Types.Date },
    gdprAcceptedOn: { type: Types.Date },
    gdprDeclinedOn: { type: Types.Date },
  },
  { collation: { locale: 'sk', strength: 1 } }
);

schema.index({ username: 1 }, { unique: true });

schema.static('findByUsername', function (username: string) {
  return this.findOne({ username }).exec();
});

schema.static('clean', function () {
  return this.deleteMany().exec();
});

schema.static('findActiveByUsername', function (username: string) {
  return this.findOne({ username, deletedOn: null }).exec();
});

schema.pre('save', async function (next) {
  //'this' refers to the current document about to be saved
  const user = this as UserDocument;

  //Replace the plain text password with the hash and then store it
  user.password = await hashPassword(user.password);
  //Indicates we're done and moves on to the next middleware
  next();
});

export const userRepository = model<UserData, UserModel>('User', schema);
