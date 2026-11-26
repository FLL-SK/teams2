import { MIN_PASSWORD_LENGTH, validatePassword } from './common';

describe('validatePassword (#281)', () => {
  it('vyžaduje reťazec s aspoň MIN_PASSWORD_LENGTH znakmi', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
    expect(validatePassword('12345678')).toBe(true);
    expect(validatePassword('1234567')).toBe(false);
    expect(validatePassword('   1234567   ')).toBe(false);
    expect(validatePassword('')).toBe(false);
    expect(validatePassword(undefined)).toBe(false);
    expect(validatePassword({ $ne: null })).toBe(false);
  });
});
