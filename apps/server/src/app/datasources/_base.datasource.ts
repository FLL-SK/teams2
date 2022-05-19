import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../graphql/apollo-context';

export class BaseDataSource extends DataSource<ApolloContext> {
  protected context: ApolloContext;

  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    this.context = config.context;
  }

}
