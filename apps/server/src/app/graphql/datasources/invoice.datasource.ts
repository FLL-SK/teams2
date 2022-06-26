import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { InvoiceItemData, invoiceItemRepository, invoiceRepository } from '../../models';
import { Invoice, InvoiceItem, InvoiceItemInput } from '../../generated/graphql';
import { InvoiceItemMapper, InvoiceMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { logger } from '@teams2/logger';

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

  async getInvoiceItems(invoiceId: ObjectId): Promise<InvoiceItem[]> {
    const items = await invoiceItemRepository.find({ invoiceId }).lean().exec();
    return items.map(InvoiceItemMapper.toInvoiceItem);
  }

  async getEventInvoiceItems(eventId: ObjectId): Promise<InvoiceItem[]> {
    const items = await invoiceItemRepository.find({ eventId }).lean().exec();
    return items.map(InvoiceItemMapper.toInvoiceItem);
  }

  async getProgramInvoiceItems(programId: ObjectId): Promise<InvoiceItem[]> {
    const items = await invoiceItemRepository
      .find({ programId })
      .sort({ lineNo: 1, text: 1 })
      .lean()
      .exec();
    return items.map(InvoiceItemMapper.toInvoiceItem);
  }

  async createInvoiceItem(item: InvoiceItemData): Promise<InvoiceItem> {
    const newItem = await invoiceItemRepository.create(item);
    return InvoiceItemMapper.toInvoiceItem(newItem);
  }

  async updateInvoiceItem(itemId: ObjectId, item: InvoiceItemInput): Promise<InvoiceItem> {
    const newItem = await invoiceItemRepository
      .findOneAndUpdate({ _id: itemId }, { $set: { ...item } }, { new: true })
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
    itemId: ObjectId,
    item: InvoiceItemInput
  ): Promise<InvoiceItem> {
    //TODO admin and program manager only
    const newItem = await this.updateInvoiceItem(itemId, item);
    return newItem;
  }

  async deleteProgramInvoiceItem(programId: ObjectId, itemId: ObjectId): Promise<InvoiceItem> {
    //TODO admin and program manager only

    return this.deleteInvoiceItem(itemId);
  }

  async createEventInvoiceItem(eventId: ObjectId, item: InvoiceItemInput): Promise<InvoiceItem> {
    //TODO admin and program manager only
    return await this.createInvoiceItem({ quantity: 0, unitPrice: 0, ...item, eventId });
  }

  async updateEventInvoiceItem(
    eventId: ObjectId,
    itemId: ObjectId,
    item: InvoiceItemInput
  ): Promise<InvoiceItem> {
    //TODO admin and program manager only
    const newItem = await this.updateInvoiceItem(itemId, item);
    return newItem;
  }

  async deleteEventInvoiceItem(programId: ObjectId, itemId: ObjectId): Promise<InvoiceItem> {
    //TODO admin and program manager only

    return this.deleteInvoiceItem(itemId);
  }

  async setInvoiceSentOn(invoiceId: ObjectId, date: Date): Promise<Invoice> {
    const invoice = await invoiceRepository
      .findOneAndUpdate({ _id: invoiceId }, { sentOn: date }, { new: true })
      .exec();
    return InvoiceMapper.toInvoice(invoice);
  }
}
