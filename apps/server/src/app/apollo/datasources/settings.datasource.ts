import { BaseDataSource } from './_base.datasource';
import { settingsRepository } from '../../models';
import { Settings, UpdateSettingsInput } from '../../generated/graphql';

import { logger } from '@teams2/logger';
import { SettingsMapper } from '../mappers/settings.mapper';

const logBase = logger('DS:Settings');

export class SettingsDataSource extends BaseDataSource {

  async get(): Promise<Settings> {
    const s = await settingsRepository.get();
    return SettingsMapper.toSettings(s);
  }

  async put(input: UpdateSettingsInput): Promise<Settings> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Put settings');
    const s = await settingsRepository.put(input);
    return SettingsMapper.toSettings(s);
  }
}
