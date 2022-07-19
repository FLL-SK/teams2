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

export const mutationResolvers: MutationResolvers<ApolloContext> = {};
