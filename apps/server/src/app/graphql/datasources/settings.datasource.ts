import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { settingsRepository } from '../../models';
import { Settings, UpdateSettingsInput } from '../../generated/graphql';

import { logger } from '@teams2/logger';
import { SettingsMapper } from '../mappers/settings.mapper';

export class SettingsDataSource extends BaseDataSource {
  constructor() {
    super();
    this.logBase = logger('DS:Settings');
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
  }

  async get(): Promise<Settings> {
    const s = await settingsRepository.get();
    return SettingsMapper.toSettings(s);
  }

  async put(input: UpdateSettingsInput): Promise<Settings> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized();
    const s = await settingsRepository.put(input);
    return SettingsMapper.toSettings(s);
  }
}
