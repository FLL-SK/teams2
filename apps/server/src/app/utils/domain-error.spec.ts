import { DomainError, domainErrorCode, failureErrors } from './domain-error';

describe('DomainError (#298)', () => {
  it('je Error s kódom a stack trace', () => {
    const e = new DomainError('team_already_registered');
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe('DomainError');
    expect(e.code).toBe('team_already_registered');
    expect(e.message).toBe('team_already_registered');
    expect(e.stack).toContain('DomainError');
    expect(new DomainError('event_full', 'Turnaj je plný').message).toBe('Turnaj je plný');
  });

  it('domainErrorCode vráti kód iba pre DomainError', () => {
    expect(domainErrorCode(new DomainError('event_full'))).toBe('event_full');
    expect(domainErrorCode(new Error('boom'))).toBeUndefined();
    expect(domainErrorCode({ name: 'team_already_registered' })).toBeUndefined();
    expect(domainErrorCode(undefined)).toBeUndefined();
  });

  it('failureErrors pridá kód porušeného pravidla', () => {
    const log = { error: vi.fn() };
    expect(failureErrors('registration_failed', new DomainError('event_full'), log)).toEqual([
      { code: 'registration_failed' },
      { code: 'event_full' },
    ]);
    expect(log.error).not.toHaveBeenCalled();
  });

  it('failureErrors pri neočakávanej chybe nevráti kód "Error", ale chybu zaloguje (regresia #298)', () => {
    const log = { error: vi.fn() };
    const e = new Error('DB nedostupná');
    expect(failureErrors('registration_failed', e, log)).toEqual([{ code: 'registration_failed' }]);
    expect(log.error).toHaveBeenCalledWith('%s: %o', 'registration_failed', e);
    // starý tvar `throw { name }` sa už nepovažuje za kód pravidla
    expect(failureErrors('registration_failed', { name: 'team_already_registered' })).toEqual([
      { code: 'registration_failed' },
    ]);
  });
});
