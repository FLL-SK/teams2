import { logger } from '@teams2/logger';
import { eventRepository, teamRepository, userRepository } from '../../models';
import { seedEvents } from './seedEvents';
import { seedTeams } from './seedTeams';

import { seedUsers } from './seedUsers';

export async function dbSeed() {
  const log = logger('dbseed');
  // clean exisiting DB
  if (process.env.NODE_ENV == 'development') {
    log.debug('cleaning repos NODE_ENV=%s', process.env.NODE_ENV);
    await eventRepository.clean();
    await teamRepository.clean();
    await userRepository.clean();

    log.debug('Seeding users:');
    await seedUsers();
    log.debug('Seeding teams:');
    await seedTeams();
    log.debug('Seeding events:');
    await seedEvents();
  }

  return;
}
