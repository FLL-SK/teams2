import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import {
  eventRepository,
  InvoiceData,
  InvoiceItemData,
  invoiceItemRepository,
  invoiceRepository,
  programRepository,
  teamRepository,
} from '../../models';
import { Invoice, InvoiceItem, InvoiceItemInput } from '../../generated/graphql';
import { InvoiceItemMapper, InvoiceMapper } from '../mappers';
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

  //TOTO: this method does not belong to datasource
  async createRegistrationInvoice(eventId: ObjectId, teamId: ObjectId): Promise<Invoice> {
    const config = getServerConfig();
    const log = this.logBase.extend('createRegInv');
    log.debug(`eventId: ${eventId}, teamId: ${teamId}`);
    const event = await eventRepository.findById(eventId).exec();
    // load team
    const team = await teamRepository.findById(teamId).exec();
    // load eventInvoiceItems
    const eventInvoiceItems = await invoiceItemRepository.find({ eventId }).lean().exec();
    // load program invoice items
    const programInvoiceItems = await invoiceItemRepository
      .find({ programId: event.programId })
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

  //TODO: emailing isnot part of datasource
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

  async getInvoiceItems(invoiceId: ObjectId): Promise<InvoiceItem[]> {
    const items = await invoiceItemRepository.find({ invoiceId }).lean().exec();
    return items.map(InvoiceItemMapper.toInvoiceItem);
  }

  async getEventInvoiceItems(eventId: ObjectId): Promise<InvoiceItem[]> {
    const items = await invoiceItemRepository.find({ eventId }).lean().exec();
    return items.map(InvoiceItemMapper.toInvoiceItem);
  }

  async getProgramInvoiceItems(programId: ObjectId): Promise<InvoiceItem[]> {
    const items = await invoiceItemRepository.find({ programId }).lean().exec();
    return items.map(InvoiceItemMapper.toInvoiceItem);
  }

  async createInvoiceItem(item: InvoiceItemData): Promise<InvoiceItem> {
    const newItem = await invoiceItemRepository.create(item);
    return InvoiceItemMapper.toInvoiceItem(newItem);
  }

  async updateInvoiceItem(item: InvoiceItemInput): Promise<InvoiceItem> {
    const newItem = await invoiceItemRepository
      .findOneAndUpdate({ _id: item.id }, { $set: { ...item } }, { new: true })
      .exec();
    return InvoiceItemMapper.toInvoiceItem(newItem);
  }

  async deleteInvoiceItem(itemId: ObjectId): Promise<InvoiceItem> {
    const deletedItem = await invoiceItemRepository.findOneAndDelete({ _id: itemId }).exec();
    return InvoiceItemMapper.toInvoiceItem(deletedItem);
  }

  async createProgramInvoiceItem(
    programId: ObjectId,
    item: InvoiceItemInput
  ): Promise<InvoiceItem> {
    //TODO admin and program manager only
    return await this.createInvoiceItem({ quantity: 0, unitPrice: 0, ...item, programId });
  }

  async updateProgramInvoiceItem(
    programId: ObjectId,
    item: InvoiceItemInput
  ): Promise<InvoiceItem> {
    //TODO admin and program manager only
    return await this.updateInvoiceItem({ ...item });
  }

  async deleteProgramInvoiceItem(programId: ObjectId, itemId: ObjectId): Promise<InvoiceItem> {
    //TODO admin and program manager only

    return this.deleteInvoiceItem(itemId);
  }
}
