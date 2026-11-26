import { BaseDataSource } from './_base.datasource';
import { settingsRepository } from '../../models';
import { Settings, UpdateSettingsInput } from '../../_generated/graphql';

import { SettingsMapper } from '../mappers/settings.mapper';
import { validateEmail } from '@teams2/common';
import { sendEmail } from '../../utils/mailer';
import { msgFromTemplate } from '../../utils/messages';

export class SettingsDataSource extends BaseDataSource {
  async get(): Promise<Settings> {
    const s = await settingsRepository.get();
    return SettingsMapper.toSettings(s);
  }

  async put(input: UpdateSettingsInput): Promise<Settings> {
    await this.userGuard.require('Put settings', this.userGuard.isAdmin());
    const s = await settingsRepository.put(input);
    return SettingsMapper.toSettings(s);
  }

  /** testovací e-mail – iba admin (#280), inak by sa dalo cez SES posielať na ľubovoľné adresy */
  async sendTestEmail(to: string, cc?: string | null): Promise<boolean> {
    await this.userGuard.require('Send test email', this.userGuard.isAdmin());
    if (!validateEmail(to) || (cc && !validateEmail(cc))) {
      throw new Error('Nesprávna e-mailová adresa.');
    }
    const title = 'TMS Test Email';
    const html = await msgFromTemplate(title, 'This is a test email from TMS');
    await sendEmail({ to, subject: title, html, cc: cc || undefined });
    return true;
  }
}
