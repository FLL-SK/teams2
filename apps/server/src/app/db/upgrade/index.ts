import debugLib from 'debug';
import mongoose from 'mongoose';
import { userRepository } from '../../models';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
}

async function copyPhone() {
  const debug = debugLib('upgrade:copyPhone');
  debug('copyPhone');
  const users = await userRepository.find({ phone: null }).exec();
  let i = 0;
  for (const u of users) {
    const et = await mongoose.connection.db.collection('t1_users').findOne({ email: u.username });
    if (et?.phone) {
      i++;
      u.phone = et.phone;
    }
    await u.save();
  }
  debug('updated %d users', i);
}
