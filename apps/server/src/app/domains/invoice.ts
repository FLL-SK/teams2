import { ObjectId } from 'mongodb';
import { getServerConfig } from '../../server-config';
import { Invoice } from '../generated/graphql';
import { ApolloContext } from '../graphql/apollo-context';
import { InvoiceMapper } from '../graphql/mappers';
import { InvoiceData, invoiceItemRepository, invoiceRepository } from '../models';
import { InvoicingAPI } from './invoicingAPI';
import { InvoicingAPISuperfaktura } from './invoicingAPI-superfaktura';

import { logger } from '@teams2/logger';

const logLib = logger('domain:Invoice');

export async function createRegistrationInvoice(
  eventId: ObjectId,
  teamId: ObjectId,
  ctx: ApolloContext
): Promise<Invoice> {
  const { dataSources } = ctx;
  const config = getServerConfig();
  const log = logLib.extend('createRegInv');
  log.debug(`eventId: ${eventId}, teamId: ${teamId}`);
  const event = await dataSources.event.getEvent(eventId);
  // load team
  const team = await dataSources.team.getTeam(teamId);
  // load eventInvoiceItems
  const eventInvoiceItems = await invoiceItemRepository
    .find({ eventId })
    .sort({ lineNo: 1, text: 1 })
    .lean()
    .exec();
  // load program invoice items
  const programInvoiceItems = await invoiceItemRepository
    .find({ programId: event.programId })
    .sort({ lineNo: 1, text: 1 })
    .lean()
    .exec();

  // create invoice
  let api: InvoicingAPI;
  if (config.invoicing.type === 'superfaktura') {
    log.debug('using superfaktura');
    api = new InvoicingAPISuperfaktura();
  }
  const invoicePost = api.constructInvoice(
    team.name,
    team.billTo,
    team.shipTo,
    eventInvoiceItems.length > 0 ? eventInvoiceItems : programInvoiceItems
  );

  // post invoice
  const result = await api.postInvoice(invoicePost);
  log.debug(`invoice posted: %o`, result);

  if (result.status === 'error') {
    log.error(`invoice post error: %s`, result.error);
    return null;
  }

  const inv: InvoiceData = {
    eventId,
    teamId,
    number: result.id,
    issuedOn: new Date(result.createdOn),
    total: result.total,
  };
  const invoice = await invoiceRepository.create(inv);
  return InvoiceMapper.toInvoice(invoice);
}

export async function emailInvoice(id: ObjectId, ctx: ApolloContext): Promise<Invoice> {
  const { dataSources } = ctx;
  const config = getServerConfig();
  const log = logLib.extend('emailInv');
  log.debug(`id: ${id}`);

  const invoice = await dataSources.invoice.getInvoice(id);
  const team = await dataSources.team.getTeam(invoice.teamId);
  const coachEmails = (await dataSources.team.getTeamCoaches(invoice.teamId)).map(
    (c) => c.username
  );

  let api: InvoicingAPI;
  if (config.invoicing.type === 'superfaktura') {
    log.debug('using superfaktura');
    api = new InvoicingAPISuperfaktura();
  }

  //TODO add internal email to bcc

  const result = await api.emailInvoice({
    id: invoice.number,
    to: team.billTo.email,
    cc: coachEmails,
    subject: `Faktura ${team.name}`,
  });
  log.debug(`invoice email sent: %o`, result);

  if (result.status === 'error') {
    log.error(`invoice email error: %s`, result.error);
    return null;
  }

  const ni = await dataSources.invoice.setInvoiceSentOn(invoice.id, new Date());

  return ni;
}
