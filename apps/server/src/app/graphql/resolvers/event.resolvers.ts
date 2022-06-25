import { updateEvent, registerTeamToEvent, unregisterTeamFromEvent } from '../../domains/event';
import { QueryResolvers, MutationResolvers, Event } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getEvent: async (_parent, { id }, { dataSources }) => dataSources.event.getEvent(id),
  getEvents: async (_parent, _args, { dataSources }) => dataSources.event.getEvents(),
};

export const typeResolver: Resolver<Event> = {
  teams: async ({ id }, _args, { dataSources }) => dataSources.event.getEventTeams(id),
  managers: async ({ id }, _args, { dataSources }) => dataSources.event.getEventManagers(id),
  program: async ({ programId }, _args, { dataSources }) =>
    dataSources.program.getProgram(programId),
  invoiceItems: async ({ id }, _args, { dataSources }) =>
    dataSources.invoice.getEventInvoiceItems(id),
};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  createEvent: (_parent, { input }, { dataSources }) => dataSources.event.createEvent(input),
  updateEvent: (_parent, { id, input }, context) => updateEvent(id, input, context),
  deleteEvent: (_parent, { id }, { dataSources }) => dataSources.event.deleteEvent(id),

  registerTeamForEvent: (_parent, { eventId, teamId }, context) =>
    registerTeamToEvent(teamId, eventId, context),

  unregisterTeamFromEvent: async (_parent, { eventId, teamId }, context) =>
    unregisterTeamFromEvent(teamId, eventId, context),

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
