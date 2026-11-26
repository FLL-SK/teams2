import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';

const { findOneAndUpdate } = vi.hoisted(() => ({ findOneAndUpdate: vi.fn() }));
vi.mock('../models', async (importOriginal) => {
  const original = await importOriginal<typeof import('../models')>();
  return { ...original, registrationRepository: { findOneAndUpdate } };
});

import router, { isValidPaymentSecret } from './payment-cb.router';

describe('isValidPaymentSecret (#283)', () => {
  it('porovná kľúč, nenastavený kľúč neprijme nič', () => {
    expect(isValidPaymentSecret('tajne', 'tajne')).toBe(true);
    expect(isValidPaymentSecret('zle', 'tajne')).toBe(false);
    expect(isValidPaymentSecret('tajne-dlhsie', 'tajne')).toBe(false);
    expect(isValidPaymentSecret('undefined', undefined)).toBe(false);
    expect(isValidPaymentSecret('', '')).toBe(false);
    expect(isValidPaymentSecret(['tajne'], 'tajne')).toBe(false);
  });
});

describe('GET /payment-cb (#283)', () => {
  let server: Server;
  let base: string;
  beforeAll(() => {
    process.env.SF_PAYMENT_KEY = 'platobny-kluc';
    const app = express();
    app.use('/payment-cb', router);
    server = app.listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/payment-cb`;
  });
  afterAll(() => server.close());
  beforeEach(() => vi.clearAllMocks());

  it('zlý kľúč → 403 bez zápisu', async () => {
    expect((await fetch(`${base}?invoice_id=1&secret_key=zly`)).status).toBe(403);
    expect((await fetch(`${base}?invoice_id=1`)).status).toBe(403);
    expect(findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('chýbajúce alebo viacnásobné invoice_id → 400', async () => {
    expect((await fetch(`${base}?secret_key=platobny-kluc`)).status).toBe(400);
    expect((await fetch(`${base}?secret_key=platobny-kluc&invoice_id=1&invoice_id=2`)).status).toBe(
      400,
    );
    expect(findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('správny kľúč označí registráciu ako zaplatenú', async () => {
    findOneAndUpdate.mockResolvedValue({ _id: 1 });
    const res = await fetch(`${base}?secret_key=platobny-kluc&invoice_id=INV-1`);
    expect(res.status).toBe(200);
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { invoiceRef: 'INV-1' },
      { paidOn: expect.any(Date) },
      { returnDocument: 'after' },
    );
  });
});
