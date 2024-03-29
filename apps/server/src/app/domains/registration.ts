import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { ApolloContext } from '../apollo/apollo-context';
import { InvoiceEmailOptions, InvoicingAPI } from './invoicingAPI';
import { InvoicingAPISuperfaktura } from './invoicingAPI-superfaktura';

import { logger } from '@teams2/logger';
import { File, RegistrationPayload } from '../_generated/graphql';
import { RegistrationMapper } from '../apollo/mappers';
import { invoiceItemRepository, registrationRepository, teamRepository } from '../models';
import { getAppSettings } from '../utils/settings';
import { createNote } from './note';

const logLib = logger('domain:Registration');

export async function createRegistrationInvoice(
  registrationId: ObjectId,
  ctx: ApolloContext,
): Promise<RegistrationPayload> {
  const { dataSources } = ctx;
  const config = getServerConfig();
  const log = logLib.extend('createRegInv');
  log.debug(`registrationId: ${registrationId}`);

  const settings = await getAppSettings();
  const reg = await registrationRepository.findById(registrationId).lean().exec();
  const items = await invoiceItemRepository.find({ registrationId }).lean().exec();

  const team = await teamRepository.findById(reg.teamId).lean().exec();

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
    reg.invoiceNote,
    { email: settings.billingEmail },
  );

  // post invoice
  const result = await api.postInvoice(invoicePost);
  log.debug(`invoice posted: %o`, result);

  if (result.status === 'error') {
    log.error(`invoice post error: %s`, result.error);
    return { errors: [{ code: 'registration_invoice_post_error', message: result.error }] };
  }

  // update registration
  const r = await dataSources.registration.setInvoicedOn(
    reg._id,
    new Date(result.createdOn),
    result.id,
  );
  return { registration: r };
}

export async function emailRegistrationInvoice(
  id: ObjectId,
  ctx: ApolloContext,
): Promise<RegistrationPayload> {
  const { dataSources } = ctx;
  const config = getServerConfig();
  const log = logLib.extend('emailInv');
  log.debug(`id: ${id}`);

  const registration = await registrationRepository.findById(id).lean().exec();
  const team = await teamRepository.findById(registration.teamId).lean().exec();
  const coachEmails = (await dataSources.team.getTeamCoaches(registration.teamId)).map(
    (c) => c.username,
  );

  // invoices will be sent bcc to organization's billing email
  const billingEmail = (await getAppSettings())?.billingEmail ?? '';

  let api: InvoicingAPI;
  if (config.invoicing.type === 'superfaktura') {
    log.debug('using superfaktura');
    api = new InvoicingAPISuperfaktura();
  }

  log.debug('going to send emails to=%s cc=%o', registration.billTo.email, coachEmails);

  const o: InvoiceEmailOptions = {
    id: registration.invoiceRef,
    to: registration.billTo.email ?? '',
    cc: coachEmails.filter((e) => e !== registration.billTo.email),
    subject: `Faktura ${team.name}`,
  };
  if (billingEmail) {
    o.bcc = [billingEmail];
  }

  const result = await api.emailInvoice(o);
  log.debug(`invoice email sent: %o`, result);

  if (result.status === 'error') {
    log.error(`invoice email error: %s`, result.error);
    return { errors: [{ code: 'registration_invoice_email_error', message: result.error }] };
  }

  const text = `Faktúra odoslaná.  \n1. platiteľ: ${
    registration.billTo.email
  }  \n2. tréner: ${coachEmails.join(', ')}  `;

  await createRegistrationNote(id, text, ctx);

  const ni = await registrationRepository.findOneAndUpdate(
    { _id: id },
    { invoiceSentOn: new Date() },
    { new: true },
  );

  return { registration: RegistrationMapper.toRegistration(ni) };
}

export async function createRegistrationNote(
  registrationId: ObjectId,
  text: string,
  ctx: ApolloContext,
) {
  return await createNote('registration', registrationId, text, ctx);
}

export async function getRegistrationFiles(
  registrationId: ObjectId,
  ctx: ApolloContext,
): Promise<File[]> {
  const log = logLib.extend('getRegFiles');
  log.debug(`registrationId: ${registrationId}`);
  const registration = await registrationRepository.findById(registrationId).lean().exec();

  let accessAllowed = ctx.userGuard.isAdmin();

  if (!accessAllowed && registration.confirmedOn && !registration.canceledOn) {
    accessAllowed = await ctx.userGuard.isCoach(registration.teamId);
    if (!accessAllowed) {
      log.debug(`not coach regid=${registrationId}`);
      return [];
    }
  }

  if (!accessAllowed) {
    log.debug(`not allowed regid=${registrationId}`);
    return [];
    throw new Error('Access denied getting files for registration');
  }

  const pf = await ctx.dataSources.file.getProgramFiles(registration.programId, false);
  const ef = await ctx.dataSources.file.getEventFiles(registration.eventId, false);
  const f = pf.concat(ef).sort((a, b) => a.name.localeCompare(b.name));

  log.debug(`returning ${f.length} files for registration ${registrationId}`);

  return f;
}
