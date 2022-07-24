import { DataSourceConfig } from 'apollo-datasource';
import { ApolloContext } from '../apollo-context';
import { BaseDataSource } from './_base.datasource';
import { InvoiceItemData, invoiceItemRepository, invoiceRepository } from '../../models';
import { Invoice, InvoiceItem, InvoiceItemInput, InvoiceItemType } from '../../generated/graphql';
import { InvoiceItemMapper, InvoiceMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { logger } from '@teams2/logger';
import { UpdateQuery } from 'mongoose';

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
    const items = await invoiceItemRepository
      .find({ eventId })
      .sort({ lineNo: 1, text: 1 })
      .lean()
      .exec();
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

  async getRegistrationInvoiceItems(registrationId: ObjectId): Promise<InvoiceItem[]> {
    const items = await invoiceItemRepository
      .find({ registrationId })
      .sort({ lineNo: 1, text: 1 })
      .lean()
      .exec();
    return items.map(InvoiceItemMapper.toInvoiceItem);
  }

  async createInvoiceItem(
    type: InvoiceItemType,
    refId: ObjectId,
    item: InvoiceItemData
  ): Promise<InvoiceItem> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const ii: InvoiceItemData = { ...item };
    switch (type) {
      case 'event':
        ii.eventId = refId;
        break;
      case 'program':
        ii.programId = refId;
        break;
      case 'registration':
        ii.registrationId = refId;
        break;
      default:
        throw new Error('Unknown invoice item type');
    }

    const newItem = await invoiceItemRepository.create(ii);
    return InvoiceItemMapper.toInvoiceItem(newItem);
  }

  async updateInvoiceItem(itemId: ObjectId, item: InvoiceItemInput): Promise<InvoiceItem> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const newItem = await invoiceItemRepository
      .findOneAndUpdate({ _id: itemId }, { $set: { ...item } }, { new: true })
      .exec();
    return InvoiceItemMapper.toInvoiceItem(newItem);
  }

  async deleteInvoiceItem(itemId: ObjectId): Promise<InvoiceItem> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const deletedItem = await invoiceItemRepository.findOneAndDelete({ _id: itemId }).exec();
    return InvoiceItemMapper.toInvoiceItem(deletedItem);
  }

  async setInvoiceSentOn(invoiceId: ObjectId, date: Date): Promise<Invoice> {
    this.userGuard.isAdmin() || this.userGuard.failed();
    const invoice = await invoiceRepository
      .findOneAndUpdate({ _id: invoiceId }, { sentOn: date }, { new: true })
      .exec();
    return InvoiceMapper.toInvoice(invoice);
  }
}
