import { UserData, userRepository } from '../../models';
import { logger } from '@teams2/logger';

export const admin_username = 'devtest+admin@fll.sk';

export const seedTestUsersData: UserData[] = [
  {
    username: admin_username,
    password: 'admin',
    isAdmin: true,
    name: 'Admin Fullname',
    phone: '01/123456789',
  },
  {
    username: 'devtest+coach1@fll.sk',
    password: 'coach1',
    name: 'Coach1 Fullname',
    phone: '02/123456789',
  },
  {
    username: 'devtest+coach2@fll.sk',
    password: 'coach2',
    name: 'Coach2 Fullname',
    phone: '03/123456789',
  },
  {
    username: 'devtest+coach3@fll.sk',
    password: 'coach3',
    name: 'Coach3 Fullname',
    phone: '04/123456789',
  },
  {
    username: 'devtest+eventmgr1@fll.sk',
    password: 'eventmgr1',
    name: 'Eventmgr1 Fullname',
    phone: '05/123456789',
  },

  {
    username: 'devtest+eventmgr2@fll.sk',
    password: 'eventmgr2',
    name: 'Eventmgr2 Fullname',
    phone: '06/123456789',
  },

  {
    username: 'devtest+progmgr1@fll.sk',
    password: 'progmgr1',
    name: 'Progmgr1 Fullname',
    phone: '07/123456789',
  },
  {
    username: 'devtest+progmgr2@fll.sk',
    password: 'progmgr2',
    name: 'Progmgr2 Fullname',
    phone: '08/123456789',
  },
];

const log = logger('testseed:Users');

export async function seedTestUsers() {
  for (const d of seedTestUsersData) {
    const u: UserData = {
      username: d.username,
      password: d.password, // hashed in pre-save hook
      isAdmin: d.isAdmin,
      name: d.name,
      phone: d.phone,
    };

    const nu = await userRepository.create(u);

    log.debug(`User created name=%s id=%s`, nu.username, nu._id);
  }
}
