/* eslint-disable @typescript-eslint/no-unused-vars */
import { Address, InvoiceItem } from '../generated/graphql';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Invoice = any;

export interface InvoicePostResult {
  status: 'ok' | 'error';
  id?: string;
  createdOn?: string;
  token?: string;
  error?: string;
  total?: number;
}

export interface InvoiceEmailOptions {
  id: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  subject?: string;
}

export interface InvoiceIssuedBy {
  name?: string;
  email: string;
  phone?: string;
  url?: string;
}

export interface InvoiceEmailResult {
  status: 'ok' | 'error';
  error?: string;
}

export class InvoicingAPI {
  getHeaders() {
    return {};
  }

  async postInvoice(invoice: Invoice): Promise<InvoicePostResult> {
    return { status: 'error', error: 'not implemented' };
  }

  constructInvoice(
    name: string,
    billTo: Address,
    shipTo: Address | undefined,
    items: Omit<InvoiceItem, 'id'>[],
    note: string,
    issuedBy: InvoiceIssuedBy
  ) {
    return 'invoice';
  }

  async emailInvoice(options: InvoiceEmailOptions): Promise<InvoiceEmailResult> {
    return { status: 'error', error: 'not implemented' };
  }
}
