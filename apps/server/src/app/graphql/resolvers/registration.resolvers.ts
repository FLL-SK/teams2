import { QueryResolvers, MutationResolvers, Registration } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getRegistration: async (_parent, { id }, { dataSources }) =>
    dataSources.registration.getRegistration(id),
  getEventRegistrations: async (_parent, { eventId }, { dataSources }) =>
    dataSources.registration.getEventRegistrations(eventId),
  getProgramRegistrations: async (_parent, { programId }, { dataSources }) =>
    dataSources.registration.getProgramRegistrations(programId),
};

export const typeResolver: Resolver<Registration> = {
  program: async ({ programId }, _args, { dataSources }) =>
    dataSources.program.getProgram(programId),
  team: async ({ teamId }, _args, { dataSources }) => dataSources.team.getTeam(teamId),
  event: async ({ eventId }, _args, { dataSources }) => dataSources.event.getEvent(eventId),
  registeredByUser: async ({ registeredBy }, _args, { dataSources }) =>
    dataSources.user.getUser(registeredBy),
  invoiceIssuedByUser: async ({ invoiceIssuedBy }, _args, { dataSources }) =>
    dataSources.user.getUser(invoiceIssuedBy),
  invoiceItems: async ({ id }, _args, { dataSources }) =>
    dataSources.invoice.getRegistrationInvoiceItems(id),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  updateRegistration: async (_parent, { id, input }, { dataSources }) =>
    dataSources.registration.updateRegistration(id, input),
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
  registrationSetTeamSize: async (_parent, { id, input }, { dataSources }) =>
    dataSources.registration.setTeamSize(id, input),
  registrationSetTeamSizeConfirmed: async (_parent, { id, date }, { dataSources }) =>
    dataSources.registration.setTeamSizeConfirmedOn(id, date),
  registrationClearTeamSizeConfirmed: async (_parent, { id }, { dataSources }) =>
    dataSources.registration.clearTeamSizeConfirmedOn(id),
};
