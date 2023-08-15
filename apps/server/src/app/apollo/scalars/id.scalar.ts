import { ApolloServerErrorCode } from '@apollo/server/errors';
import { GraphQLError, GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { ObjectId } from 'mongodb';

const errorMessage = 'Wrong ID format.';

function parse(value?: string | number | null) {
  if (value) {
    if (typeof value === 'object' && Object.keys(value).length == 0) {
      // handling of undefined
      return null;
    }
    let d: ObjectId;
    try {
      d = new ObjectId(value);
    } catch (error) {
      throw new GraphQLError(errorMessage, {
        extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
      });
    }

    return d;
  }
  return null;
}

export const scalarResolver = new GraphQLScalarType({
  name: 'ID',
  description: 'BSON ObjectId',
  serialize: (value?: ObjectId) => value?.toString() ?? null,
  parseValue: (value?: string | null): ObjectId | null => parse(value),
  parseLiteral: (ast): ObjectId | null => {
    if (ast.kind === Kind.STRING) {
      return parse(ast.value);
    } else if (ast.kind === Kind.NULL) {
      return null;
    }
    throw new GraphQLError(errorMessage, {
      extensions: { code: ApolloServerErrorCode.BAD_USER_INPUT },
    });
  },
});
