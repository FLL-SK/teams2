import { UserData, userRepository } from '../../models';
import { logger } from '@teams2/logger';

export const seedUsersData: UserData[] = [
  {
    username: 'admin@test',
    password: 'admin',
  },
  {
    username: 'coach1@test',
    password: 'coach1',
  },
  {
    username: 'coach2@test',
    password: 'coach2',
  },
  {
    username: 'coach3@test',
    password: 'coach3',
  },
  {
    username: 'eventmgr1@test',
    password: 'eventmgr1',
  },

  {
    username: 'eventmgr2@test',
    password: 'eventmgr2',
  },
];

const log = logger('seed:Users');

export async function seedUsers() {
  for (const d of seedUsersData) {
    const u: UserData = {
      username: d.username,
      password: d.password, // hashed in pre-save hook
    };

    const nu = await userRepository.create(u);

    log.debug(`User created name=%s id=%s`, nu.username, nu._id);
  }
}
