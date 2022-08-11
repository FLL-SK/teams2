import debugLib from 'debug';
import { registrationRepository, teamRepository, userRepository } from '../../models';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
  await teamCreatedOn();
  await userCreatedOn();
  await unsetRegistered();
}

async function userCreatedOn() {
  const debug = debugLib('upgrade:userCreatedOn');
  debug('ceatedOn');
  const users = await userRepository.find({ createdOn: null }).exec();
  for (const u of users) {
    const t = await teamRepository.find({ coachesIds: u._id }).sort({ createdOn: 1 }).exec();
    u.createdOn = t.length > 0 ? t[0].createdOn : new Date();
    await userRepository.updateOne({ _id: u._id }, u).exec();
  }
  debug('updated %d users', users.length);
}

async function teamCreatedOn() {
  const debug = debugLib('upgrade:teamCreatedOn');
  debug('createdOn');
  const teams = await teamRepository.find({ createdOn: null }).exec();
  for (const t of teams) {
    const r = await registrationRepository.find({ teamId: t._id }).sort({ createdOn: 1 }).exec();
    t.createdOn = r.length > 0 ? r[0].createdOn : new Date();
    if (r.length > 0) {
      t.lastRegOn = r[r.length - 1].createdOn;
    }
    await teamRepository.updateOne({ _id: t._id }, t).exec();
  }
  debug('updated %d teams', teams.length);
}

async function unsetRegistered() {
  const debug = debugLib('upgrade:unsetRegistered');
  debug('unsetRegistered');
  const r = await registrationRepository
    .updateMany(
      { registeredOn: { $exists: true } },
      { $unset: { registeredOn: null, registeredBy: null } }
    )
    .exec();
  debug('updated %d registrations', r.modifiedCount);
}
