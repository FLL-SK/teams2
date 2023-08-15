import { createPasswordResetToken } from '@teams2/auth-node';
import { emailPasswordReset } from './emails';
import { logger } from '@teams2/logger';

export function requestPassworReset(username: string) {
  const log = logger('utils:passResetRq');
  const token = createPasswordResetToken(username);
  log.debug('username=%s token=%s ', username, token);
  emailPasswordReset(username, token);
}
