import { logger } from '@teams2/logger';
import { FORBIDDEN_ERROR_CODE } from '@teams2/common';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

const log = logger('apollo-err');

export function errorFormatter(error: GraphQLError): GraphQLFormattedError {
  // zamietnutý prístup je očakávaný stav, nie zlyhanie servera (#298)
  if (error.extensions?.code === FORBIDDEN_ERROR_CODE) {
    log.warn('%s (path=%s)', error.message, error.path?.join('.'));
  } else {
    log.fatal(JSON.stringify(error), 'GraphQL error');
  }
  return error;
}
