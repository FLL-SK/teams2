import { Address, InvoiceItem } from "../generated/graphql";
import axios from "axios";
import { logger } from "@teams2/logger";

// Authorization header
const config = {
  headers: {
      'Authorization': `SFAPI email=${encodeURIComponent(process.env.SF_AUTH_EMAIL)
      }&apikey=${process.env.SF_AUTH_API_KEY
      }&company_id=${process.env.SF_AUTH_COMPANY_ID
      }&module=${process.env.SF_AUTH_MODULE}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
  }
};

class InvoiceAPI {
    constructor() {
        this.invoice = new Invoice();
    }
    constructInvoice(billTo:Address, shipTo?:Address, items:InvoiceItem[]){
      
    const sfi:Record<string,any> = {};
    sfi.Client = {
        name: billTo.name,
        
        address: billTo.street,
        city: billTo.city,
        zip: billTo.zip,

        ico: billTo.companyNumber,
        dic: billTo.taxNumber,
        ic_dph: billTo.vatNumber,
        
        email: billTo.email,
        phone: billTo.phone,
    };

    if (shipTo) {
        sfi.Client.delivery_address = shipTo.street;
        sfi.Client.delivery_city = shipTo.city;
        sfi.Client.delivery_zip = shipTo.zip; 
        sfi.Client.delivery_phone = shipTo.phone;
    }

    sfi.Invoice = {
        name:`${i.team?`Registracia tim ${i.team.name} `:'??? '}Faktura ${i.number}`,
        payment_type: 'transfer'
    };

    sfi.InvoiceItem = items.map(itm => ({
        name: itm.text,
        description: itm.note,
        quantity: itm.qty,
        tax:0,
        unit_price: itm.unitPrice
    }));

    debugLib("mapped invoice %o",sfi);
    }

    async postInvoice(billTo:Address, shipTo?:Address, items:InvoiceItem[]) {
      const log = logger('IAPI:createInvoice');
      const invoice = 
      try {
        log.debug('Posting to SF');
        const result = await axios.post(`${process.env.SF_API_URL}/invoices/create`, 'data=' + JSON.stringify(sfInvoice), config);
        debugLib('result=%o',result);

        if (result.status != 200) {
            logERR(`Failed posting invoice to Superfaktura. code=${result.status} text=${result.statusText}`);
            return false;
        }

        if (result.data.error) {
            logERR('Superfaktura reported error=%o', result.data.error_message);
            return false;
        }

        return true;
    
    } catch(err) {
        logERR('Error posting invoice to Superfaktura err=%o',err);
    }

    return false;


        return this.invoice.create(billTo, shipTo, items);
    }
