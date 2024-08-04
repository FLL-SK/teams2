import { Anchor, Box, Button, Image, Spinner, Text } from 'grommet';
import React from 'react';
import { EditAddressDialog } from '../../../components/dialogs/edit-address-dialog';
import { InplaceTextEdit } from '../../../components/editors/inplace-text';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { useNotification } from '../../../components/notifications/notification-provider';
import {
  SettingsFragmentFragment,
  useSendTestEmailMutation,
  useUpdateSettingsMutation,
} from '../../../_generated/graphql';
import { fullAddress } from '../../../utils/format-address';

interface PanelSettingsProps {
  settings?: SettingsFragmentFragment | null;
}

export function PanelSettings(props: PanelSettingsProps) {
  const { settings } = props;
  const { notify } = useNotification();
  const [editAddress, setEditAddress] = React.useState(false);

  const [updateSettings] = useUpdateSettingsMutation({
    onError: (e) => notify.error('Nepodarilo sa uložiť nastavenia.', e.message),
  });

  const [sendTestEmail] = useSendTestEmailMutation({
    onError: (e) => notify.error('Nepodarilo sa odoslať testovací email.', e.message),
  });

  return (
    <>
      {!settings && <Spinner />}
      {settings && (
        <LabelValueGroup gap="small" labelWidth="300px" direction="row">
          <LabelValue label="Názov organizácie">
            <InplaceTextEdit
              value={settings.organization.name}
              onChange={(v) =>
                updateSettings({
                  variables: { input: { organization: { ...settings.organization, name: v } } },
                })
              }
            />
          </LabelValue>
          <LabelValue label="URL adresa loga">
            <Box width="100%" pad={{ bottom: 'small' }} gap="small">
              <InplaceTextEdit
                value={settings.appLogoUrl}
                onChange={(v) => updateSettings({ variables: { input: { appLogoUrl: v } } })}
              />

              <Image src={settings.appLogoUrl ?? ''} width="200px" alt="logo" />
            </Box>
          </LabelValue>
          <LabelValue label="Adresa organizácie">
            <Box gap="small" width="100%">
              <Text>{fullAddress(settings.organization)}</Text>
              <Box alignSelf="end">
                <Anchor size="small" label="Zmeniť" onClick={() => setEditAddress(true)} />
              </Box>
            </Box>
          </LabelValue>
          <LabelValue label="Email adresa, z ktorej sa budú posielať emaily">
            <InplaceTextEdit
              value={settings.emailFrom}
              onChange={(emailFrom) => updateSettings({ variables: { input: { emailFrom } } })}
            />
          </LabelValue>

          <LabelValue label="Email kam posielať systémové notifikácie">
            <Box gap="small" width="100%">
              <InplaceTextEdit
                value={settings.sysEmail}
                onChange={(sysEmail) => updateSettings({ variables: { input: { sysEmail } } })}
              />
              <Box alignSelf="end">
                <Anchor
                  size="small"
                  label="Test"
                  onClick={() => sendTestEmail({ variables: { to: settings.sysEmail ?? '' } })}
                />
              </Box>
            </Box>
          </LabelValue>
          <LabelValue label="Email kam posielať kópie faktúr">
            <Box gap="small" width="100%">
              <InplaceTextEdit
                value={settings.billingEmail}
                onChange={(billingEmail) =>
                  updateSettings({ variables: { input: { billingEmail } } })
                }
              />
              <Box alignSelf="end">
                <Anchor
                  size="small"
                  label="Test"
                  onClick={() => sendTestEmail({ variables: { to: settings.billingEmail ?? '' } })}
                />
              </Box>
            </Box>
          </LabelValue>
          <LabelValue label="Link na pravidlá pre ochranu osobných údajov">
            <InplaceTextEdit
              value={settings.privacyPolicyUrl}
              onChange={(v) => updateSettings({ variables: { input: { privacyPolicyUrl: v } } })}
            />
          </LabelValue>
        </LabelValueGroup>
      )}

      <EditAddressDialog
        show={editAddress}
        address={settings?.organization}
        onSubmit={(s) => updateSettings({ variables: { input: { organization: s } } })}
        onClose={() => setEditAddress(false)}
      />
    </>
  );
}
