import { getServerConfig } from '../../../server-config';
import { SettingsData, settingsRepository, UserData, userRepository } from '../../models';
import { hashPassword } from '../../utils/hash-password';
import debugLib from 'debug';
import { logger } from '@teams2/logger';

export async function preSeed() {
  const debug = debugLib('preseed');
  debug('Starting preseed');
  await preSeedAdmin();
  await preseedSettings();
}

async function preSeedAdmin() {
  const username = getServerConfig().app.superadminUsername;
  if (!username) {
    // bez SUPERADMIN_USERNAME by sa hľadal/vytváral používateľ bez mena a štart servera by zlyhal
    logger('preseed').warn('SUPERADMIN_USERNAME is not set, skipping superadmin preseed');
    return;
  }
  const sa = await userRepository.findOne({ username }).exec();
  if (!sa) {
    const nsa: UserData = {
      username,
      password: await hashPassword(username),
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
