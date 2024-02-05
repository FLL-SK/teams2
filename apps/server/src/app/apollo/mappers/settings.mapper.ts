import { Settings } from '../../_generated/graphql';
import { SettingsData } from '../../models';
import { AddressMapper } from './address.mapper';

export const SettingsMapper = {
  toSettings(data: SettingsData | null | undefined): Settings | null {
    if (!data) {
      return null;
    }
    const u: Omit<Required<Settings>, '__typename'> = {
      id: data._id,
      appLogoUrl: data.appLogoUrl,
      organization: AddressMapper.toAddress(data.organization),
      sysEmail: data.sysEmail,
      emailFrom: data.emailFrom,
      billingEmail: data.billingEmail,
      privacyPolicyUrl: data.privacyPolicyUrl,
    };
    return u;
  },
};
