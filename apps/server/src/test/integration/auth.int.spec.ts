import { startTestServer, TestServer } from '../test-server';
import * as G from '../client-documents';

describe('autentifikácia (REST /auth + JWT pre /graphql)', () => {
  let srv: TestServer;

  beforeAll(async () => {
    srv = await startTestServer();
  });
  afterAll(async () => {
    await srv?.stop();
  });

  it('prihlásenie správnym heslom vráti token a používateľa', async () => {
    const { username, password, id } = srv.data.users.admin;
    const res = await fetch(`${srv.url}/auth`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.user).toMatchObject({ id, username });
  });

  it('prihlásenie zlým heslom vráti 401', async () => {
    const res = await fetch(`${srv.url}/auth`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: srv.data.users.admin.username, password: 'zle-heslo' }),
    });
    expect(res.status).toBe(401);
    expect((await res.json()).token).toBeUndefined();
  });

  it('overenie uloženého tokenu (GET /auth?token=) vydá nový token', async () => {
    const token = await srv.loginAs(srv.data.users.coach1.username, srv.data.users.coach1.password);
    const res = await fetch(`${srv.url}/auth?token=${token}`);
    const body = await res.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.user.username).toBe(srv.data.users.coach1.username);
  });

  it('neplatný token pri overení vráti chybu', async () => {
    const body = await (await fetch(`${srv.url}/auth?token=neplatny`)).json();
    expect(body.token).toBeUndefined();
    expect(body.error.message).toBe('Invalid token');
  });

  it('/graphql bez tokenu alebo s neplatným tokenom vráti 401', async () => {
    expect((await srv.gql(G.GetTagsDocument)).status).toBe(401);
    expect((await srv.gql(G.GetTagsDocument, {}, 'neplatny')).status).toBe(401);
  });

  it('/graphql s platným tokenom odpovie', async () => {
    const token = await srv.loginAs(srv.data.users.admin.username, srv.data.users.admin.password);
    const res = await srv.gql<{ getTags: unknown[] }>(G.GetTagsDocument, {}, token);
    expect(res.status).toBe(200);
    expect(res.errors).toBeUndefined();
    expect(res.data?.getTags).toHaveLength(2); // bez zmazaného tagu
  });
});
