import { appPath } from '@teams2/common';
import path = require('path');
import * as pug from 'pug';
import { getServerConfig } from '../../server-config';
import { logger } from '@teams2/logger';
import { AddressData, settingsRepository } from '../models';
import { getAppSettings } from '../utils/settings';

const getTemplate = (name: string) => pug.compileFile(path.join(__dirname, 'templates', name));

const fullAddress = (a?: AddressData | null) =>
  a ? `${a.name}, ${a.street}, ${a.city} ${a.zip}` : undefined;

export async function msgFromTemplate(title: string, message: string): Promise<string | null> {
  const template = getTemplate('message.pug');
  const log = logger('templates:msgFromTemplate');
  const settings = await getAppSettings();
  const p = {
    title,
    message,
    logoUrl: settings.appLogoUrl,
    orgName: settings.organization.name,
    orgAddress: fullAddress(settings.organization),
  };
  log.debug('params:%o', p);
  const html = template(p);
  return html;
}

export async function msgPasswordReset(email: string, token: string): Promise<string | null> {
  const log = logger('templates:msgPasswordReset');
  const template = getTemplate('forgot-password.pug');
  const url = new URL(path.join(getServerConfig().clientAppRootUrl, appPath.passwordReset));
  url.searchParams.set('token', token);
  const s = await getAppSettings();
  const p = {
    logoUrl: '',
    username: email,
    link: url.toString(),
    orgName: s.organization.name,
    orgAddress: fullAddress(s.organization),
  };
  log.debug('params:%o', p);
  const html = template(p);
  return html;
}
