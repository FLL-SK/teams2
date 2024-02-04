import { Resolvers } from '../../_generated/graphql';
import { ApolloContext } from '../apollo-context';

import * as User from './user.resolvers';
import * as Event from './event.resolvers';
import * as Registration from './registration.resolvers';
import * as Team from './team.resolvers';
import * as Program from './program.resolvers';
import * as InvoiceItem from './invoice-item.resolvers';
import * as Address from './address.resolvers';
import * as File from './file.resolvers';
import * as Tag from './tag.resolvers';
import * as Note from './note.resolvers';
import * as Settings from './settings.resolvers';

export const resolvers: Resolvers<ApolloContext> = {
  Query: {
    ...User.queryResolvers,
    ...Event.queryResolvers,
    ...Registration.queryResolvers,
    ...Team.queryResolvers,
    ...Program.queryResolvers,
    ...InvoiceItem.queryResolvers,
    ...Address.queryResolvers,
    ...File.queryResolvers,
    ...Tag.queryResolvers,
    ...Note.queryResolvers,
    ...Settings.queryResolvers,
  },
  Mutation: {
    ...User.mutationResolvers,
    ...Event.mutationResolvers,
    ...Registration.mutationResolvers,
    ...Team.mutationResolvers,
    ...Program.mutationResolvers,
    ...InvoiceItem.mutationResolvers,
    ...Address.mutationResolvers,
    ...File.mutationResolvers,
    ...Tag.mutationResolvers,
    ...Note.mutationResolvers,
    ...Settings.mutationResolvers,
  },
  User: User.typeResolver,
  Event: Event.typeResolver,
  Registration: Registration.typeResolver,
  Team: Team.typeResolver,
  Program: Program.typeResolver,
  InvoiceItem: InvoiceItem.typeResolver,
  Address: Address.typeResolver,
  File: File.typeResolver,
  Tag: Tag.typeResolver,
  Note: Note.typeResolver,
  Settings: Settings.typeResolver,
};
