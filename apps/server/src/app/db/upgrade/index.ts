import debugLib from 'debug';
import mongoose from 'mongoose';
import { RegistrationType } from '../../models';
import _ from 'lodash';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database upgrade failed: no db connection');
  }

  await allowedRegistrationTypes(db);
}

// accessing the database directly
// const et = await mongoose.connection.db.collection('t1_users').findOne({ email: u.username });

async function allowedRegistrationTypes(db: mongoose.mongo.Db) {
  const debug = debugLib('upgrade:allowedRegistrationTypes');
  debug('allowedRegistrationTypes');

  const et = db.collection('programs').find({ regTypesAllowed: null });
  for await (const p of et) {
    debug('updating program %s', p._id);
    const ta: RegistrationType[] = ['NORMAL'];
    if (p.classPackEnabled) {
      ta.push('CLASS_PACK');
    }

    await db.collection('programs').updateOne({ _id: p._id }, { $set: { regTypesAllowed: ta } });
  }
}
