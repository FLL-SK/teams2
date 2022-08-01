import debugLib from 'debug';
import { registrationRepository, userRepository } from '../../models';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
  await unsetName();
  await unsetRegistered();
}

async function unsetName() {
  const debug = debugLib('upgrade:unsetName ');
  debug('unsetName');
  const r = await userRepository
    .updateMany({ name: { $exists: true } }, { $unset: { name: null } })
    .exec();
  debug('updated %d users', r.modifiedCount);
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
