import { BaseDataSource } from './_base.datasource';
import { InvoiceItemData, invoiceItemRepository, registrationRepository } from '../../models';
import { InvoiceItem, InvoiceItemInput, InvoiceItemType } from '../../_generated/graphql';
import { InvoiceItemMapper } from '../mappers';
import { ObjectId } from 'mongodb';

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
    // fakturačné položky registrácie – rovnaké pravidlá ako čítanie registrácie (#289)
    const reg = await registrationRepository
      .findById(registrationId, { teamId: 1, programId: 1, eventId: 1 })
      .lean()
      .exec();
    if (!reg || !(await this.userGuard.canReadRegistration(reg))) {
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
    item: InvoiceItemData,
  ): Promise<InvoiceItem> {
    await this.userGuard.require('Create invoice item', this.userGuard.isAdmin());

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
    await this.userGuard.require('Update invoice item', this.userGuard.isAdmin());

    const newItem = await invoiceItemRepository
      .findOneAndUpdate({ _id: itemId }, { $set: { ...item } }, { returnDocument: 'after' })
      .exec();
    return InvoiceItemMapper.toInvoiceItem(newItem);
  }

  async deleteInvoiceItem(itemId: ObjectId): Promise<InvoiceItem> {
    await this.userGuard.require('Delete invoice item', this.userGuard.isAdmin());

    const deletedItem = await invoiceItemRepository.findOneAndDelete({ _id: itemId }).exec();
    return InvoiceItemMapper.toInvoiceItem(deletedItem);
  }
}
