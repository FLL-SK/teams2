import { Anchor, Box, Button, Spinner, Text } from 'grommet';
import React from 'react';
import { EditAddressDialog } from '../../../components/dialogs/edit-address-dialog';
import { InplaceTextEdit } from '../../../components/editors/inplace-text';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import { SettingsFragmentFragment, useUpdateSettingsMutation } from '../../../generated/graphql';
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

  return (
    <Panel title="Nastavenia" gap="medium">
      {!settings && <Spinner />}
      {settings && (
        <LabelValueGroup gap="small" labelWidth="250px" direction="row">
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
          <LabelValue label="Logo">
            <Box width="100%">
              <InplaceTextEdit
                value={settings.appLogoUrl}
                onChange={(v) => updateSettings({ variables: { input: { appLogoUrl: v } } })}
              />
              <img src={settings.appLogoUrl ?? ''} width="200px" alt="logo" />
            </Box>
          </LabelValue>
          <LabelValue label="Adresa">
            <Box gap="small" width="100%">
              <Text>{fullAddress(settings.organization)}</Text>
              <Box alignSelf="end">
                <Anchor size="small" label="Zmeniť" onClick={() => setEditAddress(true)} />
              </Box>
            </Box>
          </LabelValue>

          <LabelValue label="Email pre systémové notifikácie">
            <InplaceTextEdit
              value={settings.sysEmail}
              onChange={(v) => updateSettings({ variables: { input: { sysEmail: v } } })}
            />
          </LabelValue>
          <LabelValue label="Email pre fakúry">
            <InplaceTextEdit
              value={settings.billingEmail}
              onChange={(v) => updateSettings({ variables: { input: { billingEmail: v } } })}
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
    </Panel>
  );
}
