import { logger } from '@teams2/logger';
import {
  Invoice,
  InvoiceEmailOptions,
  InvoiceEmailResult,
  InvoiceIssuedBy,
  InvoicePostResult,
  InvoicingAPI,
} from './invoicingAPI';
import { getServerConfig } from '../../server-config';
import { AddressData, InvoiceItemData } from '../models';

import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SFInvoice = any;

export class InvoicingAPISuperfaktura extends InvoicingAPI {
  getHeaders() {
    const config = getServerConfig();

    let a = `SFAPI email=${encodeURIComponent(config.invoicing.sf.email)}`;
    a += `&apikey=${config.invoicing.sf.apiKey}`;
    a += `&company_id=${config.invoicing.sf.companyId}`;
    a += `&module=${config.invoicing.sf.module}`;

    return {
      Authorization: a,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    };
  }

  constructInvoice(
    name: string,
    billTo: AddressData,
    shipTo: AddressData | undefined,
    items: InvoiceItemData[],
    note: string,
    issuedBy: InvoiceIssuedBy,
  ): SFInvoice {
    const sfi: SFInvoice = {};
    sfi.Client = {
      name: billTo.name,

      address: billTo.street,
      city: billTo.city,
      zip: billTo.zip,

      ico: billTo.companyNumber,
      dic: billTo.taxNumber,
      ic_dph: billTo.vatNumber,

      email: encodeURIComponent(billTo.email ?? ''),
      phone: billTo.phone,
      update_addressbook: 1,
    };

    if (shipTo) {
      sfi.Client.delivery_address = shipTo.street;
      sfi.Client.delivery_city = shipTo.city;
      sfi.Client.delivery_zip = shipTo.zip;
      sfi.Client.delivery_phone = shipTo.phone;
    }

    sfi.Invoice = {
      name: name,
      payment_type: 'transfer',
      header_comment: note,
    };
    if (issuedBy.email) {
      sfi.Invoice.issued_by_email = issuedBy.email;
    }
    if (issuedBy.phone) {
      sfi.Invoice.issued_by_phone = issuedBy.phone;
    }
    if (issuedBy.url) {
      sfi.Invoice.issued_by_web = issuedBy.url;
    }
    if (issuedBy.name) {
      sfi.Invoice.issued_by = issuedBy.name;
    }

    sfi.InvoiceItem = items.map((itm) => ({
      name: itm.text,
      description: itm.note,
      quantity: itm.quantity,
      tax: 0,
      unit_price: itm.unitPrice,
    }));

    return sfi;
  }

  async postInvoice(invoice: Invoice): Promise<InvoicePostResult> {
    const log = logger('IAPI:SF:postInvoice');
    const config = getServerConfig();

    try {
      log.debug('Posting to SF %o', invoice);
      const url = `${config.invoicing.sf.apiUrl}/invoices/create`;
      log.debug('url=%s', url);
      const data = 'data=' + JSON.stringify(invoice);
      log.debug('data=%s', data);
      const headers = this.getHeaders();
      log.debug('headers=%o', headers);

      const result = await axios.post(url, data, { headers });
      log.debug('result=%s', JSON.stringify(result.data));

      if (result.status != 200) {
        log.error(
          `Failed posting invoice to Superfaktura. code=${result.status} text=${result.statusText}`,
        );
        return { status: 'error', error: result.statusText };
      }

      if (result.data.error) {
        log.error('Superfaktura reported error=%o', result.data.error_message);
        return { status: 'error', error: result.data.error_message };
      }

      return {
        status: 'ok',
        id: result.data.data.Invoice.id,
        token: result.data.data.Invoice.token,
        createdOn: result.data.data.Invoice.created,
        total: result.data.data.Invoice.amount,
      };
    } catch (err) {
      log.error('Error posting invoice to Superfaktura err=%o', err);
      if (err.response) {
        log.error('response=%o', err.response.data);
        return { status: 'error', error: err.response.data.error_message };
      } else {
        return { status: 'error', error: 'unknown error ocurred posting invoice to Superfaktura' };
      }
    }
  }

  async emailInvoice(options: InvoiceEmailOptions): Promise<InvoiceEmailResult> {
    const log = logger('IAPI:SF:emailInvoice');
    const config = getServerConfig();

    log.debug('Sending invoice PDF via email via SF');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request: any = {
      Email: {
        invoice_id: Number(options.id) ?? 0,
        to: encodeURIComponent(options.to),
        pdf_language: 'slo',
      },
    };

    if (options.cc) {
      request.Email.cc = (options.cc ?? []).map(encodeURIComponent);
    }
    if (options.bcc) {
      request.Email.bcc = (options.bcc ?? []).map(encodeURIComponent);
    }

    log.debug('request=%o', request);

    try {
      const result = await axios.post(
        `${config.invoicing.sf.apiUrl}/invoices/send`,
        'data=' + JSON.stringify(request),
        { headers: this.getHeaders() },
      );
      log.debug('result=%o', result);

      if (result.status != 200) {
        log.error(
          `Failed sending invoice PDF via Superfaktura. code=${result.status} text=${result.statusText}`,
        );
        return { status: 'error', error: result.statusText };
      }

      if (result.data.error) {
        log.error('Superfaktura reported error=%o', result.data.error_message);
        return { status: 'error', error: result.data.error_message };
      }

      return { status: 'ok' };
    } catch (err) {
      log.error('Error sending invoice PDF via Superfaktura err=%o', err);
    }

    return { status: 'error', error: 'unknown error ocurred requesting SF to email invoice' };
  }
}
