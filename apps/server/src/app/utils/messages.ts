import { appPath } from '@teams2/common';
import path from 'path';

import { getServerConfig } from '../../server-config';
import { AddressData } from '../models';
import { getAppSettings } from './settings';
import { escapeHtml, safeUrl } from './escape-html';

const fullAddress = (a?: AddressData | null) =>
  a ? `${a.name}, ${a.street}, ${a.city} ${a.zip}` : '';

/**
 * Hlavička e-mailu s logom a údajmi organizácie. Všetky hodnoty sa escapujú – texty e-mailov
 * obsahujú údaje od používateľov (názvy tímov, poznámky), ktoré nesmú vložiť HTML ani odkazy. #284
 */
const header = (logoUrl: unknown, orgName: unknown, orgAddress: string) => {
  const logo = safeUrl(logoUrl);
  return `
  <div>
    ${logo ? `<div>\n      <img src="${logo}" alt="Logo" width="150px"/>\n    </div>` : ''}
    <div>
      <h2>${escapeHtml(orgName)}</h2>
      <h4>${escapeHtml(orgAddress)}</h4>
    </div>
  </div>`;
};

export async function msgFromTemplate(title: string, message: string): Promise<string | null> {
  const settings = await getAppSettings();
  const {
    appLogoUrl: logoUrl,
    organization: { name: orgName },
  } = settings;
  const orgAddress = fullAddress(settings.organization);
  const html = `${header(logoUrl, orgName, orgAddress)}
  <div>
    <h3>${escapeHtml(title)}</h3>
    ${escapeHtml(message).replace(/\n/g, '<br/>')}
  </div>
  `;

  return html;
}

export async function msgPasswordReset(email: string, token: string): Promise<string | null> {
  const url = new URL(path.join(getServerConfig().clientAppRootUrl, appPath.passwordReset()));
  url.searchParams.set('token', token);
  const link = url.toString();

  const s = await getAppSettings();
  const logoUrl = s.appLogoUrl;
  const orgName = s.organization.name;
  const orgAddress = fullAddress(s.organization);

  const html = `${header(logoUrl, orgName, orgAddress)}
  <div>
    <h3>Žiadosť o reset hesla</h3>
    <p>Vy alebo niekto vo vašom mene požiadal o reset vášho hesla pre účet ${escapeHtml(email)}.</p>
    <p>Pokiaľ si heslo želáte zmeniť, kliknite na nasledujúcu linku</p>
    <a href="${escapeHtml(link)}">${escapeHtml(link)}</a>
    <p>Ak si heslo neželáte zmeniť, ignorujte tento email.</p>
  </div>
  `;

  return html;
}
