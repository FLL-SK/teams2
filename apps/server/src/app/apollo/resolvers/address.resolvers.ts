import { QueryResolvers, MutationResolvers, Address } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {};

export const typeResolver: Resolver<Address> = {};

export const mutationResolvers: MutationResolvers<ApolloContext> = {};
