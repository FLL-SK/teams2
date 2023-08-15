import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError, GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

const errorMessage = 'Wrong DateTime format.';

function parse(value?: string | number | null) {
  if (value) {
    if (typeof value === 'object' && Object.keys(value).length == 0) {
      // handling of undefined
      return null;
    }
    const d: Date = new Date(value);
    if (d.toString() === 'Invalid Date') {
      throw new GraphQLError(errorMessage, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
    }
    return d;
  }
  return null;
}

export const scalarResolver = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Javascript Date object',
  serialize: (value?: Date) => value?.toISOString() ?? null,
  parseValue: (value?: string | number | null): Date | null => parse(value),
  parseLiteral: (ast): Date | null => {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return parse(ast.value);
    } else if (ast.kind === Kind.NULL) {
      return null;
    }
    throw new GraphQLError(errorMessage, {
      extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
    });
  },
});
