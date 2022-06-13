import { InvoiceItemData } from '../../models';
import { InvoiceItem } from '../../generated/graphql';

export const InvoiceItemMapper = {
  toInvoiceItem(item: InvoiceItemData | null | undefined): InvoiceItem | null {
    if (!item) {
      return null;
    }
    const u: Omit<Required<InvoiceItem>, '__typename'> = {
      lineNo: item.lineNo,
      text: item.text,
      note: item.note,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    };
    return u;
  },
};
