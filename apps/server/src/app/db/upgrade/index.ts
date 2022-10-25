import debugLib from 'debug';
import mongoose from 'mongoose';
import { programRepository, registrationRepository } from '../../models';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
  await removeLightColor();
}

// accessing the database directly
// const et = await mongoose.connection.db.collection('t1_users').findOne({ email: u.username });

async function removeLightColor() {
  const debug = debugLib('upgrade:removeLightColor');
  debug('removeLightColor');

  const regs = await programRepository
    .updateMany({ colorLight: { $exists: true } }, { $unset: { colorLight: '' } })
    .exec();
  debug('updated %d registrations', regs.modifiedCount);
}
