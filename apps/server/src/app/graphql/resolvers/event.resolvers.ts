import { registerTeamToEvent, unregisterTeamFromEvent, switchTeamEvent } from '../../domains/event';
import { QueryResolvers, MutationResolvers, Event } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getEvent: async (_parent, { id }, { dataSources }) => dataSources.event.getEvent(id),
  getEvents: async (_parent, { filter }, { dataSources }) => dataSources.event.getEvents(filter),
};

export const typeResolver: Resolver<Event> = {
  registrations: async ({ id }, _args, { dataSources }) =>
    dataSources.registration.getEventTeams(id),
  managers: async ({ id }, _args, { dataSources }) => dataSources.event.getEventManagers(id),
  program: async ({ programId }, _args, { dataSources }) =>
    dataSources.program.getProgram(programId),
  invoiceItems: async ({ id }, _args, { dataSources }) =>
    dataSources.invoice.getEventInvoiceItems(id),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createEvent: (_parent, { input }, { dataSources }) => dataSources.event.createEvent(input),
  updateEvent: (_parent, { id, input }, { dataSources }) =>
    dataSources.event.updateEvent(id, input),
  deleteEvent: (_parent, { id }, { dataSources }) => dataSources.event.deleteEvent(id),

  registerTeamForEvent: (_parent, { eventId, teamId }, context) =>
    registerTeamToEvent(teamId, eventId, context),

  unregisterTeamFromEvent: async (_parent, { eventId, teamId }, context) =>
    unregisterTeamFromEvent(teamId, eventId, context),

  switchTeamEvent: async (_parent, { oldEventId, newEventId, teamId }, context) =>
    switchTeamEvent(teamId, oldEventId, newEventId, context),

  addEventManager: (_parent, { eventId, userId }, { dataSources }) =>
    dataSources.event.addEventManager(eventId, userId),
  removeEventManager: (_parent, { eventId, userId }, { dataSources }) =>
    dataSources.event.removeEventManager(eventId, userId),

  createEventInvoiceItem: (_parent, { eventId, item }, { dataSources }) =>
    dataSources.invoice.createEventInvoiceItem(eventId, item),
  updateEventInvoiceItem: (_parent, { eventId, itemId, item }, { dataSources }) =>
    dataSources.invoice.updateEventInvoiceItem(eventId, itemId, item),
  deleteEventInvoiceItem: (_parent, { eventId, itemId }, { dataSources }) =>
    dataSources.invoice.deleteEventInvoiceItem(eventId, itemId),
};
