import { QueryResolvers, MutationResolvers, Registration } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getEventRegistrations: async (_parent, { eventId }, { dataSources }) =>
    dataSources.registration.getEventRegistrations(eventId),
  getProgramRegistrations: async (_parent, { programId }, { dataSources }) =>
    dataSources.registration.getProgramRegistrations(programId),
};

export const typeResolver: Resolver<Registration> = {
  team: async ({ teamId }, _args, { dataSources }) => dataSources.team.getTeam(teamId),
  event: async ({ eventId }, _args, { dataSources }) => dataSources.event.getEvent(eventId),
  registeredByUser: async ({ registeredBy }, _args, { dataSources }) =>
    dataSources.user.getUser(registeredBy),
  invoiceIssuedByUser: async ({ invoiceIssuedBy }, _args, { dataSources }) =>
    dataSources.user.getUser(invoiceIssuedBy),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  registrationSetInvoiced: async (_parent, { id, date }, { dataSources }) =>
    dataSources.registration.setInvoicedOn(id, date),
  registrationClearInvoiced: async (_parent, { id }, { dataSources }) =>
    dataSources.registration.clearInvoicedOn(id),
  registrationSetPaid: async (_parent, { id, date }, { dataSources }) =>
    dataSources.registration.setPaidOn(id, date),
  registrationClearPaid: async (_parent, { id }, { dataSources }) =>
    dataSources.registration.clearPaidOn(id),
  registrationSetShipmentGroup: async (_parent, { id, group }, { dataSources }) =>
    dataSources.registration.setShipmentGroup(id, group),
  registrationSetShipped: async (_parent, { id, date }, { dataSources }) =>
    dataSources.registration.setShippedOn(id, date),
  registrationClearShipped: async (_parent, { id }, { dataSources }) =>
    dataSources.registration.clearShippedOn(id),
};
