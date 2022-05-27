import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { ObjectId } from 'mongodb';
import { ApolloContext } from '../graphql/apollo-context';
import { eventRepository, teamRepository } from '../models';

export class BaseDataSource extends DataSource<ApolloContext> {
  protected context: ApolloContext;

  constructor() {
    super();
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    this.context = config.context;
  }
}
