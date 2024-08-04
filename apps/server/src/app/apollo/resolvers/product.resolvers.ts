import { QueryResolvers, MutationResolvers, Product } from '../../_generated/graphql';
import { ApolloContext } from '../apollo-context';
import { EventMapper, ProgramMapper } from '../mappers';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getProducts: async (_parent, { teamId }, { dataSources }) => {
    const programs = await dataSources.program.getPrograms({ isActive: true });
    const events = await dataSources.event.getEvents({ isActive: true });
    const registrations = await dataSources.registration.getRegistrations({ teamId, active: true });
    const products = programs
      .filter((p) => !registrations.find((r) => r.programId === p.id))
      .map(ProgramMapper.toProduct)
      .concat(
        events
          .filter((e) => !registrations.find((r) => r.eventId == e.id))
          .map(EventMapper.toProduct),
      );
    return products;
  },
};

export const typeResolver: Resolver<Product> = {};

export const mutationResolvers: MutationResolvers<ApolloContext> = {};
