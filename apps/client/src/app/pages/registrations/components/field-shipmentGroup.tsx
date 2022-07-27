import { Anchor, Box, Text } from 'grommet';
import React from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { EditShipmentGroupDialog } from '../../../components/dialogs/edit-shipment-group-dialog';
import { LabelValue } from '../../../components/label-value';
import { Registration, useRegistrationSetShipmentGroupMutation } from '../../../generated/graphql';

export const FieldShipmentGroup = (props: {
  registration: Pick<Registration, 'id' | 'shipmentGroup' | 'shippedOn'>;
  readOnly: boolean;
}) => {
  const { registration, readOnly } = props;
  const { isAdmin } = useAppUser();
  const [showDialog, setShowDialog] = React.useState(false);
  const [setShipmentGroup] = useRegistrationSetShipmentGroupMutation();

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
