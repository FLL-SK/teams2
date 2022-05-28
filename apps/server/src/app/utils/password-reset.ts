import { createPasswordResetToken } from '../auth';
import { sendPasswordResetEmail } from './emails';
import { logger } from '@teams2/logger';

export function requestPassworReset(username: string) {
  const log = logger('utils:passResetRq');
  const token = createPasswordResetToken(username);
  log.debug('username=%s token=%s ', username, token);
  sendPasswordResetEmail(username, token);
}
