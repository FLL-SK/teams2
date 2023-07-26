import { BaseDataSource } from './_base.datasource';
import { InvoiceItemData, invoiceItemRepository } from '../../models';
import { InvoiceItem, InvoiceItemInput, InvoiceItemType } from '../../generated/graphql';
import { InvoiceItemMapper } from '../mappers';
import { ObjectId } from 'mongodb';

import { logger } from '@teams2/logger';

const logBase = logger('DS:Invoice');

export class InvoiceItemDataSource extends BaseDataSource {

  async getEventInvoiceItems(eventId: ObjectId): Promise<InvoiceItem[]> {
    if (!this.userGuard.isLoggedIn()) {
      return [];
    }

    const items = await invoiceItemRepository
      .find({ eventId })
      .sort({ lineNo: 1, text: 1 })
      .lean()
      .exec();
    return items.map(InvoiceItemMapper.toInvoiceItem);
  }

  async getProgramInvoiceItems(programId: ObjectId): Promise<InvoiceItem[]> {
    if (!this.userGuard.isLoggedIn()) {
      return [];
    }

    const items = await invoiceItemRepository
      .find({ programId })
      .sort({ lineNo: 1, text: 1 })
      .lean()
      .exec();
    return items.map(InvoiceItemMapper.toInvoiceItem);
  }

  async getRegistrationInvoiceItems(registrationId: ObjectId): Promise<InvoiceItem[]> {
    if (!this.userGuard.isLoggedIn() && !this.userGuard.isAdmin()) {
      return [];
    }

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
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Create invoice item');

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
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Update invoice item');

    const newItem = await invoiceItemRepository
      .findOneAndUpdate({ _id: itemId }, { $set: { ...item } }, { new: true })
      .exec();
    return InvoiceItemMapper.toInvoiceItem(newItem);
  }

  async deleteInvoiceItem(itemId: ObjectId): Promise<InvoiceItem> {
    this.userGuard.isAdmin() || this.userGuard.notAuthorized('Delete invoice item');

    const deletedItem = await invoiceItemRepository.findOneAndDelete({ _id: itemId }).exec();
    return InvoiceItemMapper.toInvoiceItem(deletedItem);
  }
}
