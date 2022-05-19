import { UserData, userRepository } from '../../models';
import { logger } from '@teams2/logger';

export const seedUsersData: UserData[] = [
  {
    username: 'admin@test'
  },
  {
    username: 'user1@test'
   }
];

const log = logger('seed:Users');

export async function seedUsers() {
  for (const d of seedUsersData) {

    const u:UserData = {
      username:d.username
    }

    const nu = await userRepository.create(u);
    
    log.debug(`User created name=%s id=%s`, nu.username, nu._id);
  }
}
