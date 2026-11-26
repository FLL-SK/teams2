import express from 'express';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { hashSync } from 'bcryptjs';
import { decode, sign } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { createPasswordResetToken, createToken } from '@teams2/auth-node';

const { findActiveByUsername, findByUsername, findOneAndUpdate, create, emailPasswordReset } =
  vi.hoisted(() => ({
    findActiveByUsername: vi.fn(),
    findByUsername: vi.fn(),
    findOneAndUpdate: vi.fn(() => ({ exec: async () => null })),
    create: vi.fn(),
    emailPasswordReset: vi.fn(),
  }));

vi.mock('../models', async (importOriginal) => {
  const original = await importOriginal<typeof import('../models')>();
  return {
    ...original,
    userRepository: { findActiveByUsername, findByUsername, findOneAndUpdate, create },
  };
});
vi.mock('../utils/emails', () => ({
  emailPasswordReset,
  emailUserSignupToAdmin: vi.fn(),
  emailUserSignupToUser: vi.fn(),
}));

import authRouter, { authRateLimiters } from './auth.router';
import { configureAuth } from '../configure-auth';

const PASSWORD = 'spravneheslo';
const HASH = hashSync(PASSWORD, 4);
const USERNAME = 'coach@example.com';

const user = (over: Record<string, unknown> = {}) => {
  const doc = {
    _id: new ObjectId(),
    username: USERNAME,
    password: HASH,
    passwordChangedOn: undefined as Date | undefined,
    save: vi.fn(async () => doc),
    ...over,
  };
  return doc;
};

let server: Server;
let base: string;

beforeAll(async () => {
  process.env.APP_JWT_SECRET = 'router-test-secret';
  const app = express();
  app.use(express.json());
  configureAuth(app);
  app.use('/auth', authRouter);
  server = app.listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/auth`;
});

afterAll(() => server.close());

beforeEach(async () => {
  vi.clearAllMocks();
  for (const l of Object.values(authRateLimiters)) {
    await l.resetKey('127.0.0.1');
    await l.resetKey('::ffff:127.0.0.1');
  }
});

const post = (path: string, body: unknown) =>
  fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /auth – prihlásenie', () => {
  it('správne heslo → prihlasovací token', async () => {
    findActiveByUsername.mockResolvedValue(user());
    const res = await post('', { username: USERNAME, password: PASSWORD });
    expect(res.status).toBe(200);
    const { token } = await res.json();
    expect(decode(token)).toMatchObject({ username: USERNAME, purpose: 'login' });
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('nesprávne heslo alebo operátor v username → 401', async () => {
    findActiveByUsername.mockResolvedValue(user());
    expect((await post('', { username: USERNAME, password: 'zle' })).status).toBe(401);
    expect((await post('', { username: { $ne: null }, password: PASSWORD })).status).toBe(401);
  });

  it('po 20 neúspešných pokusoch → 429', async () => {
    findActiveByUsername.mockResolvedValue(user());
    for (let i = 0; i < 20; i++) {
      expect((await post('', { username: USERNAME, password: 'zle' })).status).toBe(401);
    }
    expect((await post('', { username: USERNAME, password: PASSWORD })).status).toBe(429);
  });
});

describe('GET /auth – obnova tokenu', () => {
  const refresh = (token: string) =>
    fetch(base, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());

  it('platný token z hlavičky → nový token s rovnakým časom prihlásenia', async () => {
    findActiveByUsername.mockResolvedValue(user());
    const authTime = Math.floor(Date.now() / 1000) - 3600;
    const { token } = await refresh(createToken({ username: USERNAME }, authTime));
    expect(decode(token)).toMatchObject({ purpose: 'login', auth_time: authTime });
  });

  it('token na reset hesla sa nedá vymeniť za prihlasovací token', async () => {
    findActiveByUsername.mockResolvedValue(user());
    const r = await refresh(createPasswordResetToken(USERNAME, HASH));
    expect(r.token).toBeUndefined();
    expect(r.error).toBeDefined();
  });

  it('token vydaný pred zmenou hesla je neplatný', async () => {
    findActiveByUsername.mockResolvedValue(
      user({ passwordChangedOn: new Date(Date.now() + 5000) }),
    );
    const r = await refresh(createToken({ username: USERNAME }));
    expect(r.token).toBeUndefined();
  });

  it('token bez účelu (pôvodná verzia) je neplatný', async () => {
    findActiveByUsername.mockResolvedValue(user());
    const r = await refresh(sign({ username: USERNAME }, 'router-test-secret'));
    expect(r.token).toBeUndefined();
  });
});

describe('POST /auth/forgot', () => {
  it('pošle token na reset, ktorý sa dá použiť', async () => {
    findActiveByUsername.mockResolvedValue(user());
    expect((await post('/forgot', { username: USERNAME })).status).toBe(200);
    expect(emailPasswordReset).toHaveBeenCalledWith(USERNAME, expect.any(String));
    expect(decode(emailPasswordReset.mock.calls[0][1])).toMatchObject({ purpose: 'reset' });
  });

  it('operátor namiesto username – nehľadá sa, odpoveď je rovnaká', async () => {
    const res = await post('/forgot', { username: { $ne: null } });
    expect(res.status).toBe(200);
    expect(findActiveByUsername).not.toHaveBeenCalled();
    expect(emailPasswordReset).not.toHaveBeenCalled();
  });
});

describe('POST /auth/reset', () => {
  it('neplatný token → 401 (predtým 500)', async () => {
    findActiveByUsername.mockResolvedValue(user());
    expect((await post('/reset', { token: 'xxx', password: 'noveheslo1' })).status).toBe(401);
    expect((await post('/reset', { password: 'noveheslo1' })).status).toBe(401);
  });

  it('prihlasovací token sa nedá použiť na reset hesla', async () => {
    const u = user();
    findActiveByUsername.mockResolvedValue(u);
    const token = createToken({ username: USERNAME });
    expect((await post('/reset', { token, password: 'noveheslo1' })).status).toBe(401);
    expect(u.save).not.toHaveBeenCalled();
  });

  it('krátke heslo → 400', async () => {
    findActiveByUsername.mockResolvedValue(user());
    const token = createPasswordResetToken(USERNAME, HASH);
    expect((await post('/reset', { token, password: 'kratke' })).status).toBe(400);
  });

  it('platný token zmení heslo a je jednorazový', async () => {
    const u = user();
    findActiveByUsername.mockResolvedValue(u);
    const token = createPasswordResetToken(USERNAME, HASH);
    expect((await post('/reset', { token, password: 'noveheslo1' })).status).toBe(200);
    expect(u.password).toBe('noveheslo1');
    expect(u.save).toHaveBeenCalledTimes(1);

    // po zmene hesla má používateľ iný hash → rovnaký token už neplatí
    findActiveByUsername.mockResolvedValue(user({ password: hashSync('noveheslo1', 4) }));
    expect((await post('/reset', { token, password: 'ineheslo12' })).status).toBe(401);
  });
});

describe('POST /auth/signup', () => {
  const valid = {
    username: 'novy@example.com',
    password: 'noveheslo1',
    firstName: 'N',
    lastName: 'T',
    gdprAccepted: true,
  };

  it('platná registrácia', async () => {
    findByUsername.mockResolvedValue(null);
    expect((await post('/signup', valid)).status).toBe(200);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ username: 'novy@example.com' }));
  });

  it('krátke heslo, neplatné vstupy alebo existujúci (aj zmazaný) účet → 400', async () => {
    findByUsername.mockResolvedValue(null);
    expect((await post('/signup', { ...valid, password: 'kratke' })).status).toBe(400);
    expect((await post('/signup', { ...valid, username: { $ne: null } })).status).toBe(400);
    expect((await post('/signup', { ...valid, firstName: { a: 1 } })).status).toBe(400);
    findByUsername.mockResolvedValue(user({ deletedOn: new Date() }));
    expect((await post('/signup', valid)).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });
});
