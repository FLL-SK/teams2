import { logger } from '@teams2/logger';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

export function errorFormatter(error: GraphQLError): GraphQLFormattedError {
  logger('apollo-err').fatal(JSON.stringify(error), 'GraphQL error');
  return error;
}
