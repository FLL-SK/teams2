import { Application } from 'express';
import { ApolloServer, Config, ExpressContext } from 'apollo-server-express';
import { loadTypedefs } from '@graphql-tools/load';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';

import { getServerConfig } from '../../server-config';
import { resolvers } from './resolvers';
import { scalarResolvers } from './scalars';
import { initApolloContext } from './init-apollo-context';
import { ApolloContextDataSources } from './apollo-context';
import {
  EventDataSource,
  EventTeamDataSource,
  FileDataSource,
  InvoiceDataSource,
  ProgramDataSource,
  TeamDataSource,
  UserDataSource,
} from './datasources';
import { logger } from '@teams2/logger';
import { errorFormatter } from './error-formatter';

export async function bootstrapApolloServer(app: Application): Promise<void> {
  const appConfig = getServerConfig();
  const sources = await loadTypedefs(appConfig.graphQLSchemaPath, {
    // load from a single schema file
    loaders: [new GraphQLFileLoader()],
  });
  const baseTypeDefs = sources[0].rawSDL as string;

  const schema = makeExecutableSchema({
    typeDefs: [baseTypeDefs],
    resolvers: { ...resolvers, ...scalarResolvers },
  });

  const apolloServerConfig: Config<ExpressContext> = {
    schema: schema,
    context: initApolloContext,
    formatError: errorFormatter,
    dataSources: (): ApolloContextDataSources => ({
      user: new UserDataSource(),
      event: new EventDataSource(),
      team: new TeamDataSource(),
      program: new ProgramDataSource(),
      invoice: new InvoiceDataSource(),
      file: new FileDataSource(),
      eventTeam: new EventTeamDataSource(),
    }),
    introspection: true,
    debug: true,
    logger: logger('apollo-logger'),
  };

  const apolloServer = new ApolloServer(apolloServerConfig);
  await apolloServer.start();

  apolloServer.applyMiddleware({ app });
}
