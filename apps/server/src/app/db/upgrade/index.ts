import debugLib from 'debug';
import mongoose from 'mongoose';
import { registrationRepository } from '../../models';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
  enrichRegistrations();
}

// accessing the database directly
// const et = await mongoose.connection.db.collection('t1_users').findOne({ email: u.username });

async function enrichRegistrations() {
  const debug = debugLib('upgrade:enrichRegistrations');
  debug('enrichRegistrations');

  const regs = await registrationRepository
    .find({ createdOn: { $lt: new Date(2022, 0, 1) }, shippedOn: null })
    .exec();
  for (const reg of regs) {
    reg.shippedOn = reg.createdOn;
    reg.paidOn = reg.createdOn;
    reg.invoiceIssuedOn = reg.createdOn;
    await reg.save();
  }
  debug('updated %d registrations', regs.length);
}
