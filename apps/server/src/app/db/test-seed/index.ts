import { logger } from '@teams2/logger';
import {
  eventRepository,
  fileRepository,
  invoiceItemRepository,
  noteRepository,
  programRepository,
  registrationRepository,
  tagRepository,
  teamRepository,
  userRepository,
} from '../../models';
import { seedTestEvents } from './seed-test-events';
import { seedTestPrograms } from './seed-test-programs';
import { seedTestRegistrations } from './seed-test-registrations';
import { seedTestTeams } from './seed-test-teams';

import { seedTestUsers } from './seed-test-users';

export async function testDbSeed() {
  const log = logger('testseed');
  // clean exisiting DB
  if (process.env.NODE_ENV == 'development') {
    log.debug('cleaning repos NODE_ENV=%s', process.env.NODE_ENV);
    await noteRepository.clean();
    await tagRepository.clean();
    await eventRepository.clean();
    await programRepository.clean();
    await teamRepository.clean();
    await userRepository.clean();
    await invoiceItemRepository.clean();
    await registrationRepository.clean();
    await fileRepository.clean();

    log.debug('Seeding users:');
    await seedTestUsers();
    log.debug('Seeding teams:');
    await seedTestTeams();
    log.debug('Seeding programs:');
    await seedTestPrograms();
    log.debug('Seeding events:');
    await seedTestEvents();
    log.debug('Seeding registrations:');
    await seedTestRegistrations();
  }

  return;
}
