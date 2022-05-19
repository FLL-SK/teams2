import {logger} from '@teams2/logger';
import { userRepository } from '../../models';

import { seedUsers } from './seedUsers';

export async function dbSeed() {
  const log = logger('dbseed');
  // clean exisiting DB
  if (process.env.NODE_ENV == 'development') {
    log.debug('cleaning repos NODE_ENV=%s', process.env.NODE_ENV);
    await userRepository.clean();


    log.debug('Seeding users:');
    await seedUsers();
    
  }

  return;
}
