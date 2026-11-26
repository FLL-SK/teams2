import { logger } from '@teams2/logger';

const log = logger('fire-and-forget');

/**
 * Spustí asynchrónnu akciu bez čakania na výsledok (napr. odoslanie e-mailu) a chybu iba zaloguje.
 * Neošetrený reject by v Node predvolene ukončil celý proces servera. #285
 */
export function fireAndForget(action: Promise<unknown>, what: string): void {
  action.catch((e) => log.error('%s failed: %o', what, e));
}
