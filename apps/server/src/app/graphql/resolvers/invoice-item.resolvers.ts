import { QueryResolvers, MutationResolvers, InvoiceItem } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {};

export const typeResolver: Resolver<InvoiceItem> = {};

export const mutationResolvers: MutationResolvers<ApolloContext> = {};
