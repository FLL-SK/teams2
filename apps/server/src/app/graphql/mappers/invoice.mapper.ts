import { InvoiceData } from '../../models';
import { Invoice } from '../../generated/graphql';

export const InvoiceMapper = {
  toInvoice(invoice: InvoiceData | null | undefined): Invoice | null {
    if (!invoice) {
      return null;
    }
    const u: Omit<Required<Invoice>, '__typename'> = {
      id: invoice._id,
      number: invoice.number,
      total: invoice.total,

      issuedOn: invoice.issuedOn,
      sentOn: invoice.sentOn,
      paidOn: invoice.paidOn,

      teamId: invoice.teamId,
      eventId: invoice.eventId,

      event: null,
      team: null,
    };
    return u;
  },
};
