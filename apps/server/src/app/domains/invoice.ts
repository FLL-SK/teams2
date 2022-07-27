import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { ApolloContext } from '../graphql/apollo-context';
import { InvoicingAPI } from './invoicingAPI';
import { InvoicingAPISuperfaktura } from './invoicingAPI-superfaktura';

import { logger } from '@teams2/logger';
import { Registration } from '../generated/graphql';
import { RegistrationMapper } from '../graphql/mappers';
import { invoiceItemRepository, registrationRepository, teamRepository } from '../models';

const logLib = logger('domain:Invoice');

export async function createRegistrationInvoice(
  registrationId: ObjectId,
  ctx: ApolloContext
): Promise<Registration> {
  const { dataSources } = ctx;
  const config = getServerConfig();
  const log = logLib.extend('createRegInv');
  log.debug(`registrationId: ${registrationId}`);
  const reg = await registrationRepository.findById(registrationId).lean().exec();
  const team = await teamRepository.findById(reg.teamId).lean().exec();
  const items = await invoiceItemRepository.find({ registrationId }).lean().exec();

  // create invoice
  let api: InvoicingAPI;
  if (config.invoicing.type === 'superfaktura') {
    log.debug('using superfaktura');
    api = new InvoicingAPISuperfaktura();
  }
  const invoicePost = api.constructInvoice(
    `Registrácia tímu ${team.name}`,
    reg.billTo,
    reg.shipTo,
    items,
    reg.invoiceNote
  );

  // post invoice
  const result = await api.postInvoice(invoicePost);
  log.debug(`invoice posted: %o`, result);

  if (result.status === 'error') {
    log.error(`invoice post error: %s`, result.error);
    return null;
  }

  // update registration
  const r = await dataSources.registration.setInvoicedOn(
    reg._id,
    new Date(result.createdOn),
    result.id
  );
  return r;
}

export async function emailRegistrationInvoice(
  id: ObjectId,
  ctx: ApolloContext
): Promise<Registration> {
  const { dataSources } = ctx;
  const config = getServerConfig();
  const log = logLib.extend('emailInv');
  log.debug(`id: ${id}`);

  const registration = await registrationRepository.findById(id).lean().exec();
  const team = await teamRepository.findById(registration.teamId).lean().exec();
  const coachEmails = (await dataSources.team.getTeamCoaches(registration.teamId)).map(
    (c) => c.username
  );

  let api: InvoicingAPI;
  if (config.invoicing.type === 'superfaktura') {
    log.debug('using superfaktura');
    api = new InvoicingAPISuperfaktura();
  }

  //TODO add internal email to bcc

  log.debug('going to send emails to=%s cc=%o', registration.billTo.email, coachEmails);

  const result = await api.emailInvoice({
    id: registration.invoiceRef,
    to: registration.billTo.email ?? '',
    cc: coachEmails,
    subject: `Faktura ${team.name}`,
  });
  log.debug(`invoice email sent: %o`, result);

  if (result.status === 'error') {
    log.error(`invoice email error: %s`, result.error);
    return null;
  }

  const ni = await registrationRepository.findOneAndUpdate(
    { _id: id },
    { invoiceSentOn: new Date() },
    { new: true }
  );

  return RegistrationMapper.toRegistration(ni);
}
