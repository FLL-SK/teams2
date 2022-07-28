import { Settings } from '../../generated/graphql';
import { SettingsData } from '../../models';

export const SettingsMapper = {
  toSettings(data: SettingsData | null | undefined): Settings | null {
    if (!data) {
      return null;
    }
    const u: Omit<Required<Settings>, '__typename'> = {
      id: data._id,
      appLogoUrl: data.appLogoUrl,
      organization: data.organization,
      sysEmail: data.sysEmail,
      billingEmail: data.billingEmail,
    };
    return u;
  },
};
