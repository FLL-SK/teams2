import { Schema, model, Model, Document, Query, UpdateQuery } from 'mongoose';
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
  /** čas poslednej zmeny hesla – prihlasovacie tokeny vydané skôr sú neplatné (#281) */
  passwordChangedOn?: Date;
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
    // funkcia – `new Date()` by sa vyhodnotil raz pri štarte servera (#285)
    createdOn: { type: Types.Date, default: Date.now },
    deletedOn: { type: Types.Date },
    deletedBy: { type: Types.ObjectId, ref: 'User' },
    isAdmin: { type: Types.Boolean },
    isSuperAdmin: { type: Types.Boolean },
    lastLoginOn: { type: Types.Date },
    passwordChangedOn: { type: Types.Date },
    gdprAcceptedOn: { type: Types.Date },
    gdprDeclinedOn: { type: Types.Date },
  },
  { collation: { locale: 'sk', strength: 1 } },
);

schema.index({ username: 1 }, { unique: true });

schema.static('findByUsername', function (username: string) {
  return this.findOne({ username }).exec();
});

schema.static('clean', function () {
  return this.deleteMany().exec();
});

schema.static('findActiveByUsername', async function (username: string) {
  // ochrana pred operátormi MongoDB z neoverených vstupov (napr. `{ "$ne": null }` v tele požiadavky)
  if (typeof username !== 'string' || !username) {
    return null;
  }
  return this.findOne({ username, deletedOn: null }).exec();
});

/**
 * Hashuje heslo iba pri jeho zmene – inak by každé `save()` zahashovalo už zahashované heslo
 * a používateľ by sa neprihlásil. #281
 */
export async function hashPasswordOnSave(this: Document & UserData) {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await hashPassword(this.password);
  if (!this.isNew) {
    this.passwordChangedOn = new Date();
  }
}

/**
 * `findOneAndUpdate` / `updateOne` nespúšťajú hook `save` – ak update mení heslo, zahashuje ho,
 * aby sa heslo nikdy neuložilo ako čistý text. #281
 */
export async function hashPasswordOnUpdate(this: Query<unknown, UserData>) {
  const update = this.getUpdate() as UpdateQuery<UserData> | null;
  if (!update) {
    return;
  }
  const target = typeof update.$set?.password === 'string' ? update.$set : update;
  if (typeof target.password !== 'string') {
    return;
  }
  target.password = await hashPassword(target.password);
  target.passwordChangedOn = new Date();
}

schema.pre('save', hashPasswordOnSave);
schema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], hashPasswordOnUpdate);

export const userRepository = model<UserData, UserModel>('User', schema);
