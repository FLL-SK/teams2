import { logger } from '@teams2/logger';
import { eventRepository, programRepository, teamRepository, userRepository } from '../../models';
import { seedTestEvents } from './seed-test-events';
import { seedTestPrograms } from './seed-test-programs';
import { seedTestTeams } from './seed-test-teams';

import { seedTestUsers } from './seed-test-users';

export async function testDbSeed() {
  const log = logger('testseed');
  // clean exisiting DB
  if (process.env.NODE_ENV == 'development') {
    log.debug('cleaning repos NODE_ENV=%s', process.env.NODE_ENV);
    await eventRepository.clean();
    await programRepository.clean();
    await teamRepository.clean();
    await userRepository.clean();

    log.debug('Seeding users:');
    await seedTestUsers();
    log.debug('Seeding teams:');
    await seedTestTeams();
    log.debug('Seeding programs:');
    await seedTestPrograms();
    log.debug('Seeding events:');
    await seedTestEvents();
  }

  return;
}
