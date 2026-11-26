import { startTestServer, TestServer } from '../test-server';

describe('bezpečnostné hlavičky servera (#284)', () => {
  let srv: TestServer;
  beforeAll(async () => {
    srv = await startTestServer();
  });
  afterAll(async () => {
    await srv?.stop();
  });

  it('helmet nastaví hlavičky a server sa neprezrádza', async () => {
    const res = await fetch(`${srv.url}/ping`);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-frame-options')).toBeTruthy();
    expect(res.headers.get('x-powered-by')).toBeNull();
    // logo a ďalšie verejné súbory sa môžu vkladať z klienta na inej doméne
    expect(res.headers.get('cross-origin-resource-policy')).toBe('cross-origin');
  });

  it('CORS pre klienta funguje aj s hlavičkou Authorization', async () => {
    const res = await fetch(`${srv.url}/auth`, {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:4200',
        'access-control-request-method': 'GET',
        'access-control-request-headers': 'authorization',
      },
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:4200');
    expect((res.headers.get('access-control-allow-headers') ?? '').toLowerCase()).toContain(
      'authorization',
    );
  });
});
