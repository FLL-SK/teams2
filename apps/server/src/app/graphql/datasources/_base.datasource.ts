import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';

import { logger } from '@teams2/logger';
import { UserGuard } from '../../utils/user-guard';

export class BaseDataSource extends DataSource<ApolloContext> {
  protected context: ApolloContext;
  protected userGuard: UserGuard;
  protected logBase;

  constructor() {
    super();
    this.logBase = logger('DS');
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    this.context = config.context;
    this.userGuard = config.context.userGuard;
  }
}
