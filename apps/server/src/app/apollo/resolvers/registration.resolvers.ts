import { QueryResolvers, MutationResolvers, Registration } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';
import {
  emailRegistrationInvoice,
  createRegistrationInvoice,
  getRegistrationFiles,
} from '../../domains/registration';
import {
  cancelRegistration,
  registerTeamToEvent,
  changeRegisteredEvent,
} from '../../domains/event';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getRegistration: async (_parent, { id }, { dataSources }) =>
    dataSources.registration.getRegistration(id),

  getRegistrationsCount: async (_parent, { filter }, { dataSources }) =>
    dataSources.registration.getRegistrationsCount(filter),

  getEventRegistrations: async (_parent, { eventId }, { dataSources }) =>
    dataSources.registration.getEventRegistrations(eventId),
  getProgramRegistrations: async (_parent, { programId }, { dataSources }) =>
    dataSources.registration.getProgramRegistrations(programId),

  getRegistrationFiles: async (_parent, { id }, ctx) => getRegistrationFiles(id, ctx),
  getRegisteredTeams: async (_parent, { eventId, includeCoaches }, { dataSources }) =>
    dataSources.registration.getRegisteredTeams(eventId, includeCoaches),
};

export const typeResolver: Resolver<Registration> = {
  program: async ({ programId }, _args, { dataSources }) =>
    dataSources.program.getProgram(programId),
  team: async ({ teamId }, _args, { dataSources }) => dataSources.team.getTeam(teamId),
  event: async ({ eventId }, _args, { dataSources }) => dataSources.event.getEvent(eventId),
  createdByUser: async ({ createdBy }, _args, { dataSources }) =>
    dataSources.user.getUser(createdBy),
  invoiceIssuedByUser: async ({ invoiceIssuedBy }, _args, { dataSources }) =>
    dataSources.user.getUser(invoiceIssuedBy),
  invoiceItems: async ({ id }, _args, { dataSources }) =>
    dataSources.invoice.getRegistrationInvoiceItems(id),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createRegistration: (_parent, { eventId, teamId, input }, context) =>
    registerTeamToEvent(teamId, eventId, input, context),

  cancelRegistration: async (_parent, { id }, context) => cancelRegistration(id, context),

  changeRegisteredEvent: async (_parent, { registrationId, newEventId }, context) =>
    changeRegisteredEvent(registrationId, newEventId, context),

  updateRegistration: async (_parent, { id, input }, { dataSources }) =>
    dataSources.registration.updateRegistration(id, input),

  registrationSetInvoiced: async (_parent, { id, date, ref }, { dataSources }) =>
    dataSources.registration.setInvoicedOn(id, date, ref),
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

  registrationSetConfirmed: async (_parent, { id, date }, { dataSources }) =>
    dataSources.registration.setConfirmedOn(id, date),
  registrationClearConfirmed: async (_parent, { id }, { dataSources }) =>
    dataSources.registration.clearConfirmedOn(id),

  createRegistrationInvoice: async (_parent, { id }, context) =>
    createRegistrationInvoice(id, context),
  emailRegistrationInvoice: async (_parent, { id }, context) =>
    emailRegistrationInvoice(id, context),
};
