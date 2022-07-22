import debugLib from 'debug';
import mongoose from 'mongoose';
import { eventRepository, registrationRepository, teamRepository } from '../../models';

export async function upgrade() {
  const debug = debugLib('upgrade');
  debug('DB Upgrade');
  await billToShipRegistraion();
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
