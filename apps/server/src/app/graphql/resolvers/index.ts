import { Resolvers } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';

import * as User from './user.resolvers';
import * as Event from './event.resolvers';
import * as Team from './team.resolvers';
import * as Program from './program.resolvers';

export const resolvers: Resolvers<ApolloContext> = {
  Query: {
    ...User.queryResolvers,
    ...Event.queryResolvers,
    ...Team.queryResolvers,
    ...Program.queryResolvers,
  },
  Mutation: {
    ...User.mutationResolvers,
    ...Event.mutationResolvers,
    ...Team.mutationResolvers,
    ...Program.mutationResolvers,
  },
  User: User.typeResolver,
  Event: Event.typeResolver,
  Team: Team.typeResolver,
  Program: Program.typeResolver,
};
