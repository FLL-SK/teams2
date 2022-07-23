import { Anchor, Box, Text } from 'grommet';
import React from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { EditTeamSizeDialog } from '../../../components/dialogs/edit-team-size-dialog';
import { LabelValue } from '../../../components/label-value';
import { Registration, useRegistrationSetTeamSizeMutation } from '../../../generated/graphql';

export const FieldTeamSize = (props: {
  registration: Pick<Registration, 'id' | 'teamSize' | 'teamId'>;
}) => {
  const { registration } = props;
  const { isAdmin, isTeamCoach } = useAppUser();
  const [showDialog, setShowDialog] = React.useState(false);
  const [setTeamSize] = useRegistrationSetTeamSizeMutation();

  return (
    <LabelValue label="Veľkosť tímu">
      <Box direction="row" width="100%" justify="between">
        <Text>{registration.teamSize ?? '-'}</Text>

        {(isAdmin() || isTeamCoach(registration.teamId)) && (
          <Anchor size="small" label="Nastav" onClick={() => setShowDialog(true)} />
        )}
      </Box>

      <EditTeamSizeDialog
        show={showDialog}
        size={registration.teamSize}
        onClose={() => setShowDialog(false)}
        onSubmit={(size) => setTeamSize({ variables: { id: registration.id, size: Number(size) } })}
      />
    </LabelValue>
  );
};
