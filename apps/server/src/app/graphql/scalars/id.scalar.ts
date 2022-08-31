import { UserInputError } from 'apollo-server-express';
import { GraphQLScalarType } from 'graphql';
import { ObjectId } from 'mongodb';

const errorMessage = 'Wrong format of ID. Expected 24 hex characters.';

function parse(value?: string | number | null) {
  if (value) {
    if (ObjectId.isValid(value)) {
      return new ObjectId(value);
    }
    throw new UserInputError(errorMessage);
  }
  return null;
}

export const scalarResolver = new GraphQLScalarType({
  name: 'ID',
  description: 'ObjectId',
  serialize: (value?: ObjectId) => value?.toHexString() ?? null,
  parseValue: (value?: string | number | null): ObjectId | null => parse(value),
  parseLiteral: (ast): ObjectId | null => {
    if (ast.kind === 'StringValue' || ast.kind === 'IntValue') {
      return parse(ast.value);
    } else if (ast.kind === 'NullValue') {
      return null;
    }
    throw new UserInputError(errorMessage);
  },
});
