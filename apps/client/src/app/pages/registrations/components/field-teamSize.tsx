import { Anchor, Box, Text } from 'grommet';
import React, { useCallback } from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { EditTeamSizeDialog } from '../../../components/dialogs/edit-team-size-dialog';
import { LabelValue } from '../../../components/label-value';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Registration, useRegistrationSetTeamSizeMutation } from '../../../generated/graphql';
import { formatTeamSize } from '../../../utils/format-teamsize';

export const FieldTeamSize = (props: {
  registration: Pick<Registration, 'id' | 'boyCount' | 'girlCount' | 'coachCount' | 'teamId'>;
  readOnly: boolean;
}) => {
  const { registration, readOnly } = props;
  const { isAdmin, isTeamCoach } = useAppUser();
  const { notify } = useNotification();
  const onError = useCallback(
    () => notify.error('Nepodarilo sa aktualizovať registráciu.'),
    [notify]
  );

  const [showDialog, setShowDialog] = React.useState(false);
  const [setTeamSize] = useRegistrationSetTeamSizeMutation({ onError });

  return (
    <LabelValue label="Veľkosť tímu">
      <Box direction="row" width="100%" justify="between">
        <Text>{formatTeamSize(registration)}</Text>

        {(isAdmin() || isTeamCoach(registration.teamId)) && (
          <Anchor
            size="small"
            label="Nastav"
            onClick={() => setShowDialog(true)}
            disabled={readOnly}
          />
        )}
      </Box>

      <EditTeamSizeDialog
        show={showDialog}
        size={registration}
        onClose={() => setShowDialog(false)}
        onSubmit={(size) => setTeamSize({ variables: { id: registration.id, input: size } })}
      />
    </LabelValue>
  );
};
