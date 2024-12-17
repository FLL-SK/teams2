import { QueryResolvers, MutationResolvers, Event } from '../../_generated/graphql';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getEvent: async (_parent, { id }, { dataSources }) => dataSources.event.getEvent(id),
  getEvents: async (_parent, { filter }, { dataSources }) => dataSources.event.getEvents(filter),
};

export const typeResolver: Resolver<Event> = {
  registrationsCount: async ({ id }, _args, { dataSources }) =>
    dataSources.registration.getEventRegistrationsCount(id),
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
  undeleteEvent: (_parent, { id }, { dataSources }) => dataSources.event.undeleteEvent(id),

  addEventManager: (_parent, { eventId, userId }, { dataSources }) =>
    dataSources.event.addEventManager(eventId, userId),
  removeEventManager: (_parent, { eventId, userId }, { dataSources }) =>
    dataSources.event.removeEventManager(eventId, userId),
  issueEventFoodInvoices: (_parent, { eventId }, { dataSources }) =>
    dataSources.event.issueFoodInvoices(eventId),
  updateEventFoodType: (_parent, { eventId, foodType }, { dataSources }) =>
    dataSources.event.updateFoodType(eventId, foodType),
  updateEventFoodOrderDeadline: (_parent, { eventId, deadline }, { dataSources }) =>
    dataSources.event.updateFoodOrderDeadline(eventId, deadline),
  addEventFoodType: (_parent, { eventId }, { dataSources }) =>
    dataSources.event.addFoodType(eventId),
  removeEventFoodType: (_parent, { eventId, foodTypeId }, { dataSources }) =>
    dataSources.event.removeFoodType(eventId, foodTypeId),
};
