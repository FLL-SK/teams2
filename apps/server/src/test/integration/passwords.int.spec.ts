import { compare } from 'bcryptjs';
import { startTestServer, TestServer } from '../test-server';
import * as G from '../client-documents';
import { userRepository } from '../../app/models';
import { sendEmail } from '../../app/utils/mailer';
import { preSeedAdmin } from '../../app/db/preseed';

// #281 – heslá a tokeny nad skutočnou MongoDB (hooky Mongoose, reset hesla, zmena hesla)

const login = (srv: TestServer, username: string, password: string) =>
  fetch(`${srv.url}/auth`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

const post = (srv: TestServer, path: string, body: unknown) =>
  fetch(`${srv.url}/auth${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

const resetTokenFromEmail = async (): Promise<string> => {
  // e-mail sa odosiela asynchrónne (fire-and-forget)
  await vi.waitFor(() => expect(vi.mocked(sendEmail)).toHaveBeenCalled());
  const html = vi.mocked(sendEmail).mock.calls.at(-1)?.[0].html ?? '';
  const href = /href="([^"]+)"/.exec(html)?.[1] ?? '';
  return new URL(href).searchParams.get('token') ?? '';
};

describe('heslá a tokeny (#281)', () => {
  let srv: TestServer;

  beforeAll(async () => {
    srv = await startTestServer();
  });
  afterAll(async () => {
    await srv?.stop();
  });
  beforeEach(() => {
    vi.mocked(sendEmail).mockClear();
  });

  it('save() bez zmeny hesla heslo neprehashuje – používateľ sa stále prihlási', async () => {
    const { username, password } = srv.data.users.coach2;
    const u = await userRepository.findActiveByUsername(username);
    u!.firstName = 'Zmenené';
    await u!.save();
    expect((await login(srv, username, password)).status).toBe(200);
  });

  it('opakovaný preseed nezmení heslo superadmina', async () => {
    const before = (await userRepository.findOne({ username: 'superadmin@example.com' }).lean())
      ?.password;
    expect(before).toBeDefined();
    await preSeedAdmin();
    await preSeedAdmin();
    const after = (await userRepository.findOne({ username: 'superadmin@example.com' }).lean())
      ?.password;
    expect(after).toBe(before);
  });

  it('changeUserPassword uloží hash (nie čistý text) a nové heslo funguje', async () => {
    const { username, password, id } = srv.data.users.coach3;
    const token = await srv.loginAs(username, password);
    const res = await srv.gql(
      G.ChangeUserPasswordDocument,
      { id, password: 'noveheslo123' },
      token,
    );
    expect(res.errors).toBeUndefined();

    const stored = (await userRepository.findById(id).lean())!;
    expect(stored.password).not.toBe('noveheslo123');
    await expect(compare('noveheslo123', stored.password)).resolves.toBe(true);
    expect(stored.passwordChangedOn).toBeInstanceOf(Date);

    expect((await login(srv, username, 'noveheslo123')).status).toBe(200);
    expect((await login(srv, username, password)).status).toBe(401);
  });

  it('changeUserPassword odmietne krátke heslo', async () => {
    const { username, password, id } = srv.data.users.eventmgr1;
    const token = await srv.loginAs(username, password);
    const res = await srv.gql(G.ChangeUserPasswordDocument, { id, password: 'kratke' }, token);
    expect(res.errors?.[0].message).toMatch(/aspoň 8 znakov/);
  });

  it('reset hesla: token z e-mailu zmení heslo, je jednorazový a nie je prihlasovací', async () => {
    const { username, password } = srv.data.users.coach1;
    expect((await post(srv, '/forgot', { username })).status).toBe(200);
    const resetToken = await resetTokenFromEmail();
    expect(resetToken).not.toBe('');

    // reset token sa nedá použiť ako prihlasovací token
    expect((await srv.gql(G.GetTagsDocument, {}, resetToken)).status).toBe(401);
    expect(
      (await (await fetch(`${srv.url}/auth?token=${resetToken}`)).json()).token,
    ).toBeUndefined();

    const res = await post(srv, '/reset', { token: resetToken, password: 'resetnuteheslo1' });
    expect(res.status).toBe(200);
    expect((await login(srv, username, 'resetnuteheslo1')).status).toBe(200);
    expect((await login(srv, username, password)).status).toBe(401);

    // druhé použitie toho istého tokenu
    const again = await post(srv, '/reset', { token: resetToken, password: 'ineheslo1234' });
    expect(again.status).toBe(401);
  });

  it('prihlasovací token vydaný pred zmenou hesla prestane platiť', async () => {
    const { username, password, id } = srv.data.users.admin;
    const token = await srv.loginAs(username, password);
    expect((await srv.gql(G.GetTagsDocument, {}, token)).status).toBe(200);

    // zmena hesla „neskôr“ ako bol token vydaný
    await userRepository.updateOne({ _id: id }, { passwordChangedOn: new Date(Date.now() + 5000) });
    expect((await srv.gql(G.GetTagsDocument, {}, token)).status).toBe(401);
  });
});
