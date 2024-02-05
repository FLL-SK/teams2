import { Application } from 'express';
import { ApolloServer, ApolloServerOptions } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { loadTypedefs } from '@graphql-tools/load';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { createServer } from 'http';

import { getServerConfig } from '../../server-config';
import { resolvers } from './resolvers';
import { scalarResolvers } from './scalars';
import { initApolloContext } from './init-apollo-context';
import { ApolloContext } from './apollo-context';

import { logger } from '@teams2/logger';
import { errorFormatter } from './error-formatter';

export async function bootstrapApolloServer(app: Application) {
  const httpServer = createServer(app);
  const appConfig = getServerConfig();
  const sources = await loadTypedefs(appConfig.graphQLSchemaPath ?? './schema.graphql', {
    // load from a single schema file
    loaders: [new GraphQLFileLoader()],
  });
  const baseTypeDefs = sources[0].rawSDL as string;

  const schema = makeExecutableSchema({
    typeDefs: [baseTypeDefs],
    resolvers: { ...resolvers, ...scalarResolvers },
  });

  const apolloServerConfig: ApolloServerOptions<ApolloContext> = {
    schema: schema,
    cache: 'bounded',
    formatError: errorFormatter,
    introspection: true,
    logger: logger('apollo'),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  };

  const apolloServer = new ApolloServer<ApolloContext>(apolloServerConfig);
  await apolloServer.start();

  return expressMiddleware(apolloServer, {
    context: initApolloContext,
  });
}
