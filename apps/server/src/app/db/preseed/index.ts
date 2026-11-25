import { getServerConfig } from '../../../server-config';
import { SettingsData, settingsRepository, UserData, userRepository } from '../../models';
import { randomBytes } from 'node:crypto';
import debugLib from 'debug';
import { logger } from '@teams2/logger';

export async function preSeed() {
  const debug = debugLib('preseed');
  debug('Starting preseed');
  await preSeedAdmin();
  await preseedSettings();
}

export async function preSeedAdmin() {
  const username = getServerConfig().app.superadminUsername;
  if (!username) {
    // bez SUPERADMIN_USERNAME by sa hľadal/vytváral používateľ bez mena a štart servera by zlyhal
    logger('preseed').warn('SUPERADMIN_USERNAME is not set, skipping superadmin preseed');
    return;
  }
  const sa = await userRepository.findOne({ username }).exec();
  if (!sa) {
    // náhodné heslo (zahashuje ho hook pre('save')) – superadmin si ho nastaví cez
    // „Zabudnuté heslo“. Predtým bolo heslo = username a zahashovalo sa dvakrát. #281
    const nsa: UserData = {
      username,
      password: randomBytes(32).toString('base64url'),
      firstName: 'Super',
      lastName: 'Admin',
      isAdmin: true,
      isSuperAdmin: true,
      createdOn: new Date(),
    };
    await userRepository.create(nsa);
    logger('preseed').info('Superadmin %s created – set the password via "forgot password"', username);
  } else if (!sa.isSuperAdmin || !sa.isAdmin) {
    // iba príznaky – heslo sa nemení (predtým sa pri každom štarte prehashovalo cez save()) #281
    await userRepository.updateOne({ _id: sa._id }, { isSuperAdmin: true, isAdmin: true }).exec();
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
