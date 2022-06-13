import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';

import { logger } from '@teams2/logger';

export class BaseDataSource extends DataSource<ApolloContext> {
  protected context: ApolloContext;
  protected logBase;

  constructor() {
    super();
    this.logBase = logger('DS:Base');
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    this.context = config.context;
  }
}
