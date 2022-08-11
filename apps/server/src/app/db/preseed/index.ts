import { getServerConfig } from '../../../server-config';
import { SettingsData, settingsRepository, UserData, userRepository } from '../../models';
import { hashPassword } from '../../utils/hash-password';
import debugLib from 'debug';

export async function preSeed() {
  const debug = debugLib('preseed');
  debug('Starting preseed');
  await preSeedAdmin();
  await preseedSettings();
}

async function preSeedAdmin() {
  const sa = await userRepository
    .findOne({ username: getServerConfig().app.superadminUsername })
    .exec();
  if (!sa) {
    const nsa: UserData = {
      username: getServerConfig().app.superadminUsername,
      password: await hashPassword(getServerConfig().app.superadminUsername),
      firstName: 'Super',
      lastName: 'Admin',
      isAdmin: true,
      isSuperAdmin: true,
      createdOn: new Date(),
    };
    await userRepository.create(nsa);
  } else {
    sa.isSuperAdmin = true;
    sa.isAdmin = true;
    await sa.save();
  }
}

async function preseedSettings() {
  const s = await settingsRepository.get();
  if (!s) {
    const ns: SettingsData = {
      organization: {
        name: 'Nasa organizacia',
        street: 'Ulica',
        city: 'Mesto',
        zip: 'PSC',
      },
    };
    await settingsRepository.create(ns);
  }
}
