import { appPath } from '@teams2/common';
import path from 'path';

import { getServerConfig } from '../../server-config';
import { AddressData } from '../models';
import { getAppSettings } from './settings';

const fullAddress = (a?: AddressData | null) =>
  a ? `${a.name}, ${a.street}, ${a.city} ${a.zip}` : undefined;

export async function msgFromTemplate(title: string, message: string): Promise<string | null> {
  const settings = await getAppSettings();
  const {
    appLogoUrl: logoUrl,
    organization: { name: orgName },
  } = settings;
  const orgAddress = fullAddress(settings.organization);
  const html = `
  <div>
    <div>
      <img src="${logoUrl}" alt="Logo" width="150px"/>
    </div>
    <div>
      <h2>${orgName}</h2>
      <h4>${orgAddress}</h4>
    </div>
  </div>  
  <div>
    <h3>${title}</h3>
    ${message.replace(/\n/g, '<br/>')}
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

  const html = `
  <div>
    <div>
      <img src="${logoUrl}" alt="Logo" width="150px"/>
    </div>
    <div>
      <h2>${orgName}</h2>
      <h4>${orgAddress}</h4>
    </div>
  </div>
  <div>
    <h3>Žiadosť o reset hesla</h3>
    <p>Vy alebo niekto vo vašom mene požiadal o reset vášho hesla pre účet ${email}.</p>
    <p>Pokiaľ si heslo želáte zmeniť, kliknite na nasledujúcu linku</p>
    <a href="${link}">${link}</a>
    <p>Ak si heslo neželáte zmeniť, ignorujte tento email.</p>
  </div>
  `;

  return html;
}
