import debugLib from 'debug';
import { registrationRepository, teamRepository, userRepository } from '../../models';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
  await nameToFullName();
  await registeredToCreadted();
}

async function nameToFullName() {
  const debug = debugLib('upgrade:nameToFullName');
  debug('nameToFullName');
  const users = await userRepository.find({ firstName: null }).exec();
  for (const user of users) {
    const n = (user.name ?? '').split(' ');
    if (n.length > 0) {
      user.firstName = n[0] ?? '';
    } else {
      user.firstName = 'x';
      user.lastName = user.username;
    }
    if (n.length > 1) {
      user.lastName = n[1] ?? '';
    }
    await user.save();
  }
  debug('updated %d registrations', users.length);
}

async function registeredToCreadted() {
  const debug = debugLib('upgrade:registeredToCreated');
  debug('registeredToCreated');
  const registrations = await registrationRepository.find({ createdOn: null }).exec();
  for (const registration of registrations) {
    if (!registration.createdOn) {
      registration.createdOn = registration.registeredOn;
      registration.createdBy = registration.registeredBy;
    }
    await registration.save();
  }
  debug('updated %d registrations', registrations.length);
}

async function billToShipRegistraion() {
  const debug = debugLib('upgrade:billToShipRegistration');
  debug('billToShipRegistration');
  const registrations = await registrationRepository.find({}).exec();
  for (const registration of registrations) {
    const team = await teamRepository.findById(registration.teamId).exec();
    if (!registration.billTo && team) {
      registration.billTo = team.billTo ?? team.address;
    }
    if (!registration.shipTo && team) {
      registration.shipTo = team.shipTo ?? team.billTo ?? team.address;
    }
    await registration.save();
  }
  debug('updated %d registrations', registrations.length);
}
