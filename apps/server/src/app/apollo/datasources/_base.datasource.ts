import { ApolloContext } from '../apollo-context';

import { UserGuard } from '../../utils/user-guard';

export class BaseDataSource {
  protected context: ApolloContext;
  protected userGuard: UserGuard;

  constructor(config: { context: ApolloContext }) {
    this.context = config.context;
    this.userGuard = config.context.userGuard;
    this._initialize();
  }

  protected _initialize() {
    // override this method to initialize the data source
  }
}

