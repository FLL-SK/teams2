import { UserData, userRepository } from '../../models';
import { logger } from '@teams2/logger';

export const admin_username = 'devtest+admin@fll.sk';

export const seedTestUsersData: UserData[] = [
  {
    username: admin_username,
    password: 'admin',
    isAdmin: true,
    firstName: 'AdminFirst',
    lastName: 'AdminLast',
    phone: '01/123456789',
  },
  {
    username: 'devtest+coach1@fll.sk',
    password: 'coach1',
    firstName: 'CoachFirst1',
    lastName: 'CoachLast1',
    phone: '02/123456789',
  },
  {
    username: 'devtest+coach2@fll.sk',
    password: 'coach2',
    firstName: 'CoachFirst2',
    lastName: 'CoachLast2',
    phone: '03/123456789',
  },
  {
    username: 'devtest+coach3@fll.sk',
    password: 'coach3',
    firstName: 'CoachFirst3',
    lastName: 'CoachLast3',
    phone: '04/123456789',
  },
  {
    username: 'devtest+eventmgr1@fll.sk',
    password: 'eventmgr1',
    firstName: 'EventMgrFirst1',
    lastName: 'EventMgrLast1',
    phone: '05/123456789',
  },

  {
    username: 'devtest+eventmgr2@fll.sk',
    password: 'eventmgr2',
    firstName: 'EventMgrFirst2',
    lastName: 'EventMgrLast2',
    phone: '06/123456789',
  },

  {
    username: 'devtest+progmgr1@fll.sk',
    password: 'progmgr1',
    firstName: 'ProgMgrFirst1',
    lastName: 'ProgMgrLast1',
    phone: '07/123456789',
  },
  {
    username: 'devtest+progmgr2@fll.sk',
    password: 'progmgr2',
    firstName: 'ProgMgrFirst2',
    lastName: 'ProgMgrLast2',
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
      firstName: d.firstName,
      lastName: d.lastName,
      phone: d.phone,
    };

    const nu = await userRepository.create(u);

    log.debug(`User created name=%s id=%s`, nu.username, nu._id);
  }
}
