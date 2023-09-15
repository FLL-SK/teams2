import debugLib from 'debug';
import mongoose from 'mongoose';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
  await normalRegistrations();
  //await removeLightColor();
}

// accessing the database directly
// const et = await mongoose.connection.db.collection('t1_users').findOne({ email: u.username });

async function normalRegistrations() {
  const debug = debugLib('upgrade:normalRegistrations');
  debug('normalRegistrations');
  const et = mongoose.connection.db.collection('registrations').find({ type: null });
  for await (const r of et) {
    debug('updating registration %s', r._id);
    await mongoose.connection.db
      .collection('registrations')
      .updateOne(
        { _id: r._id },
        { $set: { type: 'NORMAL', impactedTeams: 0, impactedChildren: 0 } },
      );
  }
}
