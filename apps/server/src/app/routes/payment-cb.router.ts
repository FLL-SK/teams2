import { logger } from '@teams2/logger';
import express from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';
import { getServerConfig } from '../../server-config';
import { registrationRepository } from '../models';

const router = express.Router();
export default router;

const logLib = logger('rt-payment-cb');

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest();

/**
 * Porovnanie tajného kľúča v konštantnom čase (#283). Hashovanie zjednotí dĺžku vstupov,
 * takže z času odpovede sa nedá odvodiť ani dĺžka kľúča. Nenastavený kľúč neprijme nič.
 */
export function isValidPaymentSecret(provided: unknown, expected: string | undefined): boolean {
  if (!expected || typeof provided !== 'string' || !provided) {
    return false;
  }
  return timingSafeEqual(sha256(provided), sha256(expected));
}

// SuperFaktúra volá callback GET požiadavkou s `invoice_id` a `secret_key` v query
router.get('/', async (req, res) => {
  const log = logLib.extend('cb');
  const invoiceRef = req.query.invoice_id;

  if (
    !isValidPaymentSecret(req.query.secret_key, getServerConfig().invoicing.sf.payment_secret_key)
  ) {
    log.error('invalid secret_key request from %s', req.ip ?? '-');
    return res.status(403).send('Invalid secret key');
  }
  if (typeof invoiceRef !== 'string' || !invoiceRef) {
    return res.status(400).send('Missing invoice_id');
  }
  log.debug('invoiceId=%s', invoiceRef);

  const r = await registrationRepository.findOneAndUpdate(
    { invoiceRef },
    { paidOn: new Date() },
    { returnDocument: 'after' },
  );

  if (!r) {
    return res.status(404).send('Invoice not found');
  }

  log.info('InvoiceRef=%s paid', invoiceRef);
  return res.status(200).send('OK');
});
