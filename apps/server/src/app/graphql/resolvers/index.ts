import { Resolvers } from '../../generated/graphql';
import { ApolloContext } from '../apollo-context';

import * as User from './user.resolvers';
import * as Event from './event.resolvers';
import * as EventTeam from './event-team.resolvers';
import * as Team from './team.resolvers';
import * as Program from './program.resolvers';
import * as InvoiceItem from './invoice-item.resolvers';
import * as Address from './address.resolvers';
import * as Invoice from './invoice.resolvers';
import * as File from './file.resolvers';
import * as Tag from './tag.resolvers';
import * as Note from './note.resolvers';

export const resolvers: Resolvers<ApolloContext> = {
  Query: {
    ...User.queryResolvers,
    ...Event.queryResolvers,
    ...EventTeam.queryResolvers,
    ...Team.queryResolvers,
    ...Program.queryResolvers,
    ...InvoiceItem.queryResolvers,
    ...Invoice.queryResolvers,
    ...Address.queryResolvers,
    ...File.queryResolvers,
    ...Tag.queryResolvers,
    ...Note.queryResolvers,
  },
  Mutation: {
    ...User.mutationResolvers,
    ...Event.mutationResolvers,
    ...EventTeam.mutationResolvers,
    ...Team.mutationResolvers,
    ...Program.mutationResolvers,
    ...InvoiceItem.mutationResolvers,
    ...Invoice.mutationResolvers,
    ...Address.mutationResolvers,
    ...File.mutationResolvers,
    ...Tag.mutationResolvers,
    ...Note.mutationResolvers,
  },
  User: User.typeResolver,
  Event: Event.typeResolver,
  EventTeam: EventTeam.typeResolver,
  Team: Team.typeResolver,
  Program: Program.typeResolver,
  InvoiceItem: InvoiceItem.typeResolver,
  Invoice: Invoice.typeResolver,
  Address: Address.typeResolver,
  File: File.typeResolver,
  Tag: Tag.typeResolver,
  Note: Note.typeResolver,
};
