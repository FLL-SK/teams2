import debugLib from 'debug';
import mongoose from 'mongoose';
import { eventRepository, registrationRepository, teamRepository } from '../../models';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
  //await moveToRegistrationCollection();
  await addProjectIdToRegistration();
}

async function addTagFieldToTeam() {
  const debug = debugLib('upgrade:addTagFieldToTeam');
  debug('addTagFieldToTeam');
  const t = await teamRepository.updateMany({ teamIds: null }, { $set: { teamIds: [] } }).exec();
  debug('updated %o', t);
}

async function moveToRegistrationCollection() {
  const debug = debugLib('upgrade:moveToReg');
  const et = await mongoose.connection.db.collection('eventteams').find({}).toArray();
  console.log(et);
  debug('moveToRegistrationCollection');
  const res = await mongoose.connection.db
    .collection('eventteams')
    .aggregate([{ $match: {} }, { $out: 'registrations' }])
    .toArray();
  debug('updated %o', res);
}

async function addProjectIdToRegistration() {
  const debug = debugLib('upgrade:addProjectIdToRegistration');
  debug('addProjectIdToRegistration');
  const events = await eventRepository.find({}).exec();
  for (const event of events) {
    await registrationRepository
      .updateMany({ eventId: event._id, programId: null }, { $set: { programId: event.programId } })
      .exec();
  }
  debug('updated %d events', events.length);
}
