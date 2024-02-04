import { InvoiceItemData } from '../../models';
import { InvoiceItem } from '../../_generated/graphql';

export const InvoiceItemMapper = {
  toInvoiceItem(item: InvoiceItemData | null | undefined): InvoiceItem | null {
    if (!item) {
      return null;
    }
    const u: Omit<Required<InvoiceItem>, '__typename'> = {
      id: item._id,
      lineNo: item.lineNo,
      text: item.text,
      note: item.note,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      public: item.public,
    };
    return u;
  },
};
