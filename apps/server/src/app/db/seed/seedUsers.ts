import { UserData, userRepository } from '../../models';
import { compare, hash } from 'bcryptjs';
import { logger } from '@teams2/logger';

export const seedUsersData: UserData[] = [
  {
    username: 'admin@test',
    password: 'admin',
  },
  {
    username: 'user1@test',
    password: 'user1',
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
