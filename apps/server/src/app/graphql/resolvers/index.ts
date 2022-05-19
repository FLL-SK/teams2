import { Resolvers } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';

import * as User from './user.resolvers';

export const resolvers: Resolvers<ApolloContext> = {
  Query: {
    ...User.queryResolvers,
  },
  Mutation: {
    ...User.mutationResolvers,
  },
  User: User.typeResolver,
};
