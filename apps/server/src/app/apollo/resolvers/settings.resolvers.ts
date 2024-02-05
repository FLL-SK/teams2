import { QueryResolvers, MutationResolvers, Settings } from '../../_generated/graphql';
import { sendEmail } from '../../utils/mailer';
import { msgFromTemplate } from '../../utils/messages';
import { ApolloContext } from '../apollo-context';
import { Resolver } from '../type-resolver';

export const queryResolvers: QueryResolvers<ApolloContext> = {
  getSettings: async (_parent, _args, { dataSources }) => dataSources.settings.get(),
};

export const typeResolver: Resolver<Settings> = {};

export const mutationResolvers: MutationResolvers<ApolloContext> = {
  updateSettings: async (_parent, { input }, { dataSources }) => dataSources.settings.put(input),
  sendTestEmail: async (_parent, { to, cc }) => {
    const title = 'TMS Test Email';
    const text = 'This is a test email from TMS';
    const html = await msgFromTemplate(title, text);
    await sendEmail({ to, subject: title, html, cc });
    return true;
  },
};
