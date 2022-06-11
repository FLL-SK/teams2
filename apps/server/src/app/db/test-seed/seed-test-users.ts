import { UserData, userRepository } from '../../models';
import { logger } from '@teams2/logger';

export const seedTestUsersData: UserData[] = [
  {
    username: 'admin@test',
    password: 'admin',
    isAdmin: true,
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

  {
    username: 'progmgr1@test',
    password: 'progmgr1',
  },
  {
    username: 'progmgr2@test',
    password: 'progmgr2',
  },
];

const log = logger('testseed:Users');

export async function seedTestUsers() {
  for (const d of seedTestUsersData) {
    const u: UserData = {
      username: d.username,
      password: d.password, // hashed in pre-save hook
      isAdmin: d.isAdmin,
    };

    const nu = await userRepository.create(u);

    log.debug(`User created name=%s id=%s`, nu.username, nu._id);
  }
}
