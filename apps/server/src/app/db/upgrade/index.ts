import debugLib from 'debug';
import mongoose from 'mongoose';
import { teamRepository } from '../../models';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
  //await moveToRegistrationCollection();
}

async function addTagFieldToTeam() {
  const debug = debugLib('upgrade:addTagFieldToTeam');
  debug('addTagFieldToTeam');
  const t = await teamRepository.updateMany({ teamIds: null }, { $set: { teamIds: [] } }).exec();
  debug('updated %o', t);
}

async function moveToRegistrationCollection() {
  const debug = debugLib('upgrade:moveToReg');
  debug('moveToRegistrationCollection');
  const res = await mongoose.connection.db
    .collection('EventTeam')
    .aggregate([{ $match: {} }, { $out: 'Registration' }]);
  debug('updated %o', res);
}
