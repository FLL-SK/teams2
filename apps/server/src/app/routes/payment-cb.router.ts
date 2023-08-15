import { logger } from '@teams2/logger';
import express from 'express';
import { getServerConfig } from '../../server-config';
import { registrationRepository } from '../models';

const router = express.Router();
export default router;

const logLib = logger('rt-payment-cb');

router.get('/', async (req, res) => {
  const invoiceRef = (req.query.invoice_id as string) ?? 'undefined';
  const secret_key = (req.query.secret_key as string) ?? 'undefined';
  const log = logLib.extend('cb');
  log.debug('invoiceId=%s secret_key=%s', invoiceRef, secret_key);

  if (getServerConfig().invoicing.sf.payment_secret_key !== secret_key) {
    log.error('invalid secret_key request from %s', req.ip.toString());
    return res.status(403).send('Invalid secret key');
  }

  const r = await registrationRepository.findOneAndUpdate(
    { invoiceRef },
    { paidOn: new Date() },
    { new: true }
  );

  if (!r) {
    return res.status(404).send('Invoice not found');
  }

  log.info('InvoiceRef=%s paid', invoiceRef);
  return res.status(200).send('OK');
});
