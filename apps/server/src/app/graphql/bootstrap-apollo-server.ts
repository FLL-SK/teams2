import { Application } from 'express';
import { ApolloServer, Config, ExpressContext } from 'apollo-server-express';
import { loadTypedefs } from '@graphql-tools/load';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';


import { getAppConfig } from '../../app-config';
import { resolvers } from './resolvers';
import { scalarResolvers } from './scalars';
import { initApolloContext } from './init-apollo-context';
import { ApolloContextDataSources } from './apollo-context';
import { UserDataSource } from '../datasources';
import { logger } from '@teams2/logger';
import { errorFormatter } from './error-formatter';


export async function bootstrapApolloServer(app: Application): Promise<void> {
  const appConfig = getAppConfig();
  const sources = await loadTypedefs(appConfig.graphQLSchemaPath, {
    // load from a single schema file
    loaders: [new GraphQLFileLoader()]
  });
  const baseTypeDefs = sources[0].rawSDL as string;

  const schema = makeExecutableSchema({
    typeDefs: [baseTypeDefs],
    resolvers: { ...resolvers, ...scalarResolvers }
  });
 
  const apolloServerConfig: Config<ExpressContext> = {
    schema: schema,
    context: initApolloContext,
    formatError: errorFormatter,
    dataSources: (): ApolloContextDataSources => ({
      user: new UserDataSource()
    }),
    introspection: true,
    debug: true,
    logger: logger('apollo-logger')
  };

  const apolloServer = new ApolloServer(apolloServerConfig);
  await apolloServer.start();

  apolloServer.applyMiddleware({ app });
}
