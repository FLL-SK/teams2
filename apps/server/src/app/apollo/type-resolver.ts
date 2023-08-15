/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLResolveInfo } from 'graphql';
import { ApolloContext } from './apollo-context';

export type Resolver<T, U = Record<string, unknown>> = {
  [P in keyof Partial<T>]: (parent: T, args: U, ctx: ApolloContext, info: GraphQLResolveInfo) => any;
};

export type InterfaceResolver<T, P, U = Record<string, unknown>> = Resolver<T, U> & {
  __resolveType: (parent: P, ctx: ApolloContext, info: GraphQLResolveInfo) => any | null;
};
