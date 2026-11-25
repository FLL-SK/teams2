import express from 'express';
import { sign } from 'jsonwebtoken';
import {
  configure,
  createPasswordResetToken,
  createToken,
  MAX_SESSION_AGE_SECONDS,
  verifyPasswordResetToken,
  verifyToken,
} from './passport-jwt-auth';

const SECRET = 'test-secret';
const HASH = '$2a$10$aktualnyhashhesla';

beforeAll(() => {
  configure(
    express(),
    () => SECRET,
    async () => null,
    async () => null,
  );
});

afterEach(() => {
  vi.useRealTimers();
});

describe('prihlasovací token (#281)', () => {
  it('createToken + verifyToken vráti používateľa a časy', () => {
    const au = verifyToken(createToken({ username: 'a@example.com', id: '1' }));
    expect(au).toMatchObject({ username: 'a@example.com', id: '1' });
    expect(au?.issuedAt).toEqual(expect.any(Number));
    expect(au?.authTime).toBe(au?.issuedAt);
  });

  it('pri obnove sa zachová čas pôvodného prihlásenia', () => {
    const authTime = Math.floor(Date.now() / 1000) - 3600;
    expect(verifyToken(createToken({ username: 'a@example.com' }, authTime))?.authTime).toBe(
      authTime,
    );
  });

  it('po MAX_SESSION_AGE_SECONDS od prihlásenia sa token neprijme', () => {
    const authTime = Math.floor(Date.now() / 1000) - MAX_SESSION_AGE_SECONDS - 1;
    expect(verifyToken(createToken({ username: 'a@example.com' }, authTime))).toBeNull();
  });

  it('token bez účelu (pôvodná verzia) sa neprijme', () => {
    expect(verifyToken(sign({ username: 'a@example.com' }, SECRET))).toBeNull();
  });

  it('token s algoritmom none alebo iným secretom sa neprijme', () => {
    const payload = { username: 'a@example.com', purpose: 'login', auth_time: 1 };
    expect(verifyToken(sign(payload, 'iny-secret'))).toBeNull();
    const none = sign(payload, '', { algorithm: 'none' });
    expect(verifyToken(none)).toBeNull();
  });

  it('token na reset hesla nie je prihlasovací token', () => {
    expect(verifyToken(createPasswordResetToken('a@example.com', HASH))).toBeNull();
  });
});

describe('token na reset hesla (#281)', () => {
  const getHash = (hash: string | null) => vi.fn(async () => hash);

  it('platný token vráti username', async () => {
    const token = createPasswordResetToken('a@example.com', HASH);
    const get = getHash(HASH);
    await expect(verifyPasswordResetToken(token, get)).resolves.toBe('a@example.com');
    expect(get).toHaveBeenCalledWith('a@example.com');
  });

  it('po zmene hesla (iný hash) je token neplatný – jednorazovosť', async () => {
    const token = createPasswordResetToken('a@example.com', HASH);
    await expect(verifyPasswordResetToken(token, getHash('$2a$10$novyhash'))).resolves.toBeNull();
  });

  it('prihlasovací token sa nedá použiť na reset hesla', async () => {
    const token = createToken({ username: 'a@example.com' });
    await expect(verifyPasswordResetToken(token, getHash(HASH))).resolves.toBeNull();
  });

  it('neexistujúci používateľ, neplatný alebo chýbajúci token → null', async () => {
    const token = createPasswordResetToken('a@example.com', HASH);
    await expect(verifyPasswordResetToken(token, getHash(null))).resolves.toBeNull();
    await expect(verifyPasswordResetToken('xxx', getHash(HASH))).resolves.toBeNull();
    await expect(verifyPasswordResetToken(undefined, getHash(HASH))).resolves.toBeNull();
    await expect(
      verifyPasswordResetToken({ $ne: null } as unknown, getHash(HASH)),
    ).resolves.toBeNull();
  });

  it('expirovaný token (po 1 hodine) je neplatný', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const token = createPasswordResetToken('a@example.com', HASH);
    vi.setSystemTime(Date.now() + 61 * 60 * 1000);
    await expect(verifyPasswordResetToken(token, getHash(HASH))).resolves.toBeNull();
  });
});
