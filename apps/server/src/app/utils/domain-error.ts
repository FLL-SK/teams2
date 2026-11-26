import type { ErrorCode } from '@teams2/common';

/**
 * Porušenie biznis pravidla s kódom pre používateľa (#298) – namiesto `throw { name: '…' }`.
 * Volajúci ho prevedie na `errors[]` v payloade mutácie.
 */
export class DomainError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'DomainError';
    this.code = code;
  }
}

/** kód chyby pre payload, ak ide o `DomainError`, inak `undefined` */
export function domainErrorCode(e: unknown): ErrorCode | undefined {
  return e instanceof DomainError ? e.code : undefined;
}

/**
 * Chyby pre payload mutácie: všeobecný kód a pri porušení pravidla (`DomainError`) aj jeho kód.
 * Neočakávaná chyba sa iba zaloguje – predtým sa do payloadu dostal kód `"Error"` (#298).
 */
export function failureErrors(
  code: ErrorCode,
  e: unknown,
  log?: { error: (format: string, ...args: unknown[]) => void },
): { code: ErrorCode }[] {
  const ruleCode = domainErrorCode(e);
  if (!ruleCode) {
    log?.error('%s: %o', code, e);
    return [{ code }];
  }
  return [{ code }, { code: ruleCode }];
}
