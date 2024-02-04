import { Anchor, Box, Text } from 'grommet';
import React, { useCallback } from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { EditShipmentGroupDialog } from '../../../components/dialogs/edit-shipment-group-dialog';
import { LabelValue } from '../../../components/label-value';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Registration, useRegistrationSetShipmentGroupMutation } from '../../../_generated/graphql';

export const FieldShipmentGroup = (props: {
  registration: Pick<Registration, 'id' | 'shipmentGroup' | 'shippedOn'>;
  readOnly: boolean;
}) => {
  const { registration, readOnly } = props;
  const { isAdmin } = useAppUser();

  const { notify } = useNotification();
  const onError = useCallback(
    () => notify.error('Nepodarilo sa aktualizovať registráciu.'),
    [notify],
  );

  const [showDialog, setShowDialog] = React.useState(false);
  const [setShipmentGroup] = useRegistrationSetShipmentGroupMutation({ onError });

  return (
    <LabelValue label="Dodacia skupina">
      <Box direction="row" width="100%" justify="between">
        <Text>{registration.shipmentGroup ?? '-'}</Text>
        {isAdmin() && !registration.shippedOn && (
          <Anchor
            size="small"
            label="Nastav"
            onClick={() => setShowDialog(true)}
            disabled={readOnly}
          />
        )}
      </Box>
      <EditShipmentGroupDialog
        show={showDialog}
        group={registration.shipmentGroup}
        onClose={() => setShowDialog(false)}
        onSubmit={(group) => setShipmentGroup({ variables: { id: registration.id, group } })}
      />
    </LabelValue>
  );
};
