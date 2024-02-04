import { QueryResolvers, MutationResolvers, InvoiceItem } from '../../_generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {};

export const typeResolver: Resolver<InvoiceItem> = {};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createInvoiceItem: (_parent, { type, refId, item }, { dataSources }) =>
    dataSources.invoice.createInvoiceItem(type, refId, item),
  updateInvoiceItem: (_parent, { id, item }, { dataSources }) =>
    dataSources.invoice.updateInvoiceItem(id, item),
  deleteInvoiceItem: (_parent, { id }, { dataSources }) =>
    dataSources.invoice.deleteInvoiceItem(id),
};
