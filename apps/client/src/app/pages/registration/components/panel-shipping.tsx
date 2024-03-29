import { Anchor, Box, Paragraph, Text } from 'grommet';
import React, { useState } from 'react';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import {
  RegistrationFragmentFragment,
  useUpdateRegistrationMutation,
} from '../../../_generated/graphql';
import { FieldShipmentGroup } from '../../registrations/components/field-shipmentGroup';
import { FieldShippedOn } from '../../registrations/components/field-shippedOn';
import { fullAddress } from '../../../utils/format-address';
import { EditAddressDialog } from '../../../components/dialogs/edit-address-dialog';
import { EditContactDialog } from '../../../components/dialogs/edit-contact-dialog';
import { Panel } from '../../../components/panel';
import { useNotification } from '../../../components/notifications/notification-provider';

interface PanelRegistrationShippingProps {
  registration: RegistrationFragmentFragment;
  columnWidth: string;
  readOnly: boolean;
}

export function PanelRegistrationShipping(props: PanelRegistrationShippingProps) {
  const { registration: reg, columnWidth, readOnly } = props;
  const { notify } = useNotification();
  const [editShipToAddress, setEditShipToAddress] = useState(false);
  const [editShipToContact, setEditShipToContact] = useState(false);

  const [updateRegistration] = useUpdateRegistrationMutation({
    onError: () => notify.error('Nepodarilo sa aktualizovať registráciu.'),
  });

  return (
    <>
      <Panel title="Dodanie" wrap direction="row" gap="small">
        <Box width={columnWidth}>
          <LabelValueGroup labelWidth="150px" gap="small" direction="row">
            <LabelValue label="Dodacia adresa">
              <Box>
                <Text>{fullAddress(reg.shipTo)}</Text>
                <Anchor
                  disabled={!!reg.shippedOn || readOnly}
                  size="small"
                  label="Upraviť"
                  onClick={() => setEditShipToAddress(true)}
                />
              </Box>
            </LabelValue>
          </LabelValueGroup>
        </Box>
        <Box width={columnWidth}>
          <LabelValueGroup labelWidth="250px" gap="small" direction="row">
            <LabelValue label="Kontakt">
              <Box>
                <Paragraph margin="none">
                  {reg.shipTo.contactName}
                  <br />
                  {reg.shipTo.email}
                  <br />
                  {reg.shipTo.phone}
                </Paragraph>
                <Anchor
                  disabled={!!reg.shippedOn || readOnly}
                  size="small"
                  label="Upraviť"
                  onClick={() => setEditShipToContact(true)}
                />
              </Box>
            </LabelValue>
            <FieldShipmentGroup registration={reg} readOnly={readOnly} />
            <FieldShippedOn registration={reg} readOnly={readOnly} />
          </LabelValueGroup>
        </Box>
      </Panel>

      <EditAddressDialog
        show={editShipToAddress}
        address={reg.shipTo}
        onClose={() => setEditShipToAddress(false)}
        onSubmit={(data) =>
          updateRegistration({
            variables: { id: reg.id, input: { shipTo: { ...reg.shipTo, ...data } } },
          })
        }
      />
      <EditContactDialog
        show={editShipToContact}
        contact={reg.shipTo}
        onClose={() => setEditShipToContact(false)}
        onSubmit={(data) =>
          updateRegistration({
            variables: { id: reg.id, input: { shipTo: { ...reg.shipTo, ...data } } },
          })
        }
      />
    </>
  );
}
