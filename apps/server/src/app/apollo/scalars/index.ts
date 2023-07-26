import { Resolvers } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';

import * as IDScalar from './id.scalar';
import * as DateTimeScalar from './datetime.scalar';

export const scalarResolvers: Resolvers<ApolloContext> = {
  ID: IDScalar.scalarResolver,
  DateTime: DateTimeScalar.scalarResolver,
};
