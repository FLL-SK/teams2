import express from 'express';
import type { AddressInfo } from 'node:net';
import morgan from 'morgan';
import { REQUEST_LOG_FORMAT, urlWithoutQuery } from './request-log';

describe('logovanie HTTP požiadaviek bez query stringu (#282)', () => {
  it('urlWithoutQuery odstráni query string', () => {
    expect(urlWithoutQuery('/auth?token=abc.def.ghi')).toBe('/auth');
    expect(urlWithoutQuery('/payment-cb?invoice_id=1&secret_key=tajne')).toBe('/payment-cb');
    expect(urlWithoutQuery('/graphql')).toBe('/graphql');
    expect(urlWithoutQuery(undefined)).toBe('-');
  });

  it('v logu nie je token ani secret_key', async () => {
    const lines: string[] = [];
    const app = express();
    app.use(morgan(REQUEST_LOG_FORMAT, { stream: { write: (l: string) => lines.push(l) } }));
    app.get(/.*/, (_req, res) => {
      res.send('ok');
    });
    const server = app.listen(0);
    try {
      const { port } = server.address() as AddressInfo;
      await fetch(`http://127.0.0.1:${port}/auth?token=tajny-token`);
      await fetch(`http://127.0.0.1:${port}/payment-cb?invoice_id=1&secret_key=tajny-kluc`);
      // morgan zapisuje po skončení odpovede
      await new Promise((r) => setTimeout(r, 20));
    } finally {
      server.close();
    }
    const log = lines.join('');
    expect(log).toContain('GET /auth 200');
    expect(log).toContain('GET /payment-cb 200');
    expect(log).not.toContain('tajny-token');
    expect(log).not.toContain('tajny-kluc');
  });
});
