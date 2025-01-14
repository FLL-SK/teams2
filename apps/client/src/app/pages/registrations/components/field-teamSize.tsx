import { Anchor, Box, Button, Text, Tip } from 'grommet';
import React, { useCallback } from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { EditTeamSizeDialog } from '../../../components/dialogs/edit-team-size-dialog';
import { LabelValue } from '../../../components/label-value';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Registration, useRegistrationSetTeamSizeMutation } from '../../../_generated/graphql';
import { formatTeamSize } from '../../../utils/format-teamsize';
import { WidthType } from 'grommet/utils';

export const FieldTeamSize = (props: {
  registration: Pick<Registration, 'id' | 'boyCount' | 'girlCount' | 'coachCount' | 'teamId'>;
  readOnly: boolean;
  direction?: 'row' | 'column';
  labelWidth?: string;
}) => {
  const { registration, readOnly, direction = 'row' } = props;
  const { isAdmin, isTeamCoach } = useAppUser();
  const { notify } = useNotification();
  const onError = useCallback(
    () => notify.error('Nepodarilo sa aktualizovať registráciu.'),
    [notify],
  );

  const [showDialog, setShowDialog] = React.useState(false);
  const [setTeamSize] = useRegistrationSetTeamSizeMutation({ onError });

  return (
    <LabelValue
      label="Veľkosť tímu"
      tip="Počet detí a trénerov, ktorí sa záčastnia na turnaji."
      direction={direction}
      labelWidth={props.labelWidth}
    >
      <Box
        direction={direction}
        width="100%"
        //justify="between"
        align={direction === 'column' ? 'center' : undefined}
        gap="small"
      >
        <Text>{formatTeamSize(registration)}</Text>

        {(isAdmin() || isTeamCoach(registration.teamId)) && (
          <Box direction="row">
            <Button
              size="small"
              label="Nastav"
              onClick={() => setShowDialog(true)}
              disabled={readOnly}
            />
          </Box>
        )}
      </Box>

      <EditTeamSizeDialog
        show={showDialog}
        teamSize={registration}
        onClose={() => setShowDialog(false)}
        onSubmit={(size) => setTeamSize({ variables: { id: registration.id, input: size } })}
      />
    </LabelValue>
  );
};
