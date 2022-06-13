import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import {
  eventRepository,
  InvoiceData,
  invoiceRepository,
  programRepository,
  teamRepository,
} from '../../models';
import { Invoice } from '../../generated/graphql';
import { InvoiceMapper } from '../mappers';
import { ObjectId } from 'mongodb';
import { InvoicingAPI } from '../../domains/invoicingAPI';

import { logger } from '@teams2/logger';
import { InvoicingAPISuperfaktura } from '../../domains/invoicingAPI-superfaktura';
import { getServerConfig } from '../../../server-config';

export class InvoiceDataSource extends BaseDataSource {
  constructor() {
    super();
    this.logBase = logger('DS:Invoice');
  }

  initialize(config: DataSourceConfig<ApolloContext>) {
    super.initialize(config);
  }

  async getInvoice(id: ObjectId): Promise<Invoice> {
    return InvoiceMapper.toInvoice(await invoiceRepository.findById(id).exec());
  }

  async getInvoices(): Promise<Invoice[]> {
    const invoices = await invoiceRepository.find().exec();
    return invoices.map((i) => InvoiceMapper.toInvoice(i));
  }

  async createRegistrationInvoice(eventId: ObjectId, teamId: ObjectId): Promise<Invoice> {
    const config = getServerConfig();
    const log = this.logBase.extend('createRegInv');
    log.debug(`eventId: ${eventId}, teamId: ${teamId}`);
    const event = await eventRepository.findById(eventId).exec();
    // load team
    const team = await teamRepository.findById(teamId).exec();
    // load program
    const program = await programRepository.findById(event.programId).exec();

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
      event.invoiceItems.length > 0 ? event.invoiceItems : program.invoiceItems
    );

    // post invoice
    const result = await api.postInvoice(invoicePost);
    log.debug(`invoice posted: %o`, result);

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

  async emailInvoice(id: ObjectId): Promise<Invoice> {
    const config = getServerConfig();
    const log = this.logBase.extend('emailInv');
    log.debug(`id: ${id}`);

    const invoice = await invoiceRepository.findById(id).exec();
    const team = await teamRepository.findById(invoice.teamId).exec();

    let api: InvoicingAPI;
    if (config.invoicing.type === 'superfaktura') {
      log.debug('using superfaktura');
      api = new InvoicingAPISuperfaktura();
    }

    //TODO add coaches to cc
    //TODO add internal email to bcc

    const result = await api.emailInvoice({
      id: invoice.number,
      to: team.billTo.email,
      subject: `Faktura ${team.name}`,
    });
    log.debug(`invoice email sent: %o`, result);
    if (result.status === 'error') {
      log.error(`invoice email error: %s`, result.error);
      return null;
    }

    invoice.sentOn = new Date();
    await invoice.save();

    return InvoiceMapper.toInvoice(invoice);
  }
}
