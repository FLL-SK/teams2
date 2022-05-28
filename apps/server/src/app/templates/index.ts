import { appPath } from '@teams2/common';
import path = require('path');
import * as pug from 'pug';
import { getServerConfig } from '../../server-config';
import { logger } from '@teams2/logger';

const getTemplate = (name: string) => pug.compileFile(path.join(__dirname, 'templates', name));

export function msgFromTemplate(title: string, message: string): string {
  const template = getTemplate('message.pug');
  const log = logger('templates:msgFromTemplate');
  const params = { title, message, logoUrl: getServerConfig().logoUrl };
  log.debug('params:%o', params);
  const html = template(params);
  return html;
}

export function msgPasswordReset(email: string, token: string): string {
  const log = logger('templates:msgPasswordReset');
  const template = getTemplate('forgot-password.pug');
  const url = new URL(path.join(getServerConfig().clientAppRootUrl, appPath.passwordReset));
  url.searchParams.set('token', token);
  const params = { logoUrl: '', username: email, link: url.toString() };
  log.debug('params:%o', params);
  const html = template(params);
  return html;
}
