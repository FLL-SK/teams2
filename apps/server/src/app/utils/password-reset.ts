import { createPasswordResetToken } from '@teams2/auth-node';
import { emailPasswordReset } from './emails';
import { logger } from '@teams2/logger';
import { userRepository } from '../models';

/**
 * Pošle používateľovi e-mail s jednorazovým odkazom na reset hesla.
 * Token je viazaný na aktuálny hash hesla – po zmene hesla prestane platiť. #281
 */
export function requestPasswordReset(user: { username: string; password: string }) {
  const log = logger('utils:passResetRq');
  const token = createPasswordResetToken(user.username, user.password);
  log.debug('username=%s', user.username);
  emailPasswordReset(user.username, token);
}

/** aktuálny hash hesla aktívneho používateľa – na overenie tokenu na reset hesla */
export async function getActiveUserPasswordHash(username: string): Promise<string | null> {
  const u = await userRepository.findActiveByUsername(username);
  return u?.password ?? null;
}
