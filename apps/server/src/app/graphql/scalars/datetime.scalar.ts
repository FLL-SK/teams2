import { UserInputError } from 'apollo-server-express';
import { GraphQLScalarType } from 'graphql';

const errorMessage = 'Wrong DateTime format.';

function parse(value?: string | number | null) {
  if (value) {
    if (typeof value === 'object' && Object.keys(value).length == 0) {
      // handling of undefined
      return null;
    }
    const d: Date = new Date(value);
    if (d.toString() === 'Invalid Date') {
      throw new UserInputError(errorMessage);
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
    if (ast.kind === 'StringValue' || ast.kind === 'IntValue') {
      return parse(ast.value);
    } else if (ast.kind === 'NullValue') {
      return null;
    }
    throw new UserInputError(errorMessage);
  },
});
