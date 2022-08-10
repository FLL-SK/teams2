import { Box, Button } from 'grommet';
import { Add } from 'grommet-icons';
import React, { useState } from 'react';
import { EditEmailDialog } from '../../../components/dialogs/edit-email-dialog';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import {
  TeamFragmentFragment,
  useAddCoachToTeamMutation,
  useRemoveCoachFromTeamMutation,
} from '../../../generated/graphql';
import { CoachList } from './coach-list';

interface PanelTeamCoachesProps {
  team?: TeamFragmentFragment;
  canEdit: boolean;
}

export function PanelTeamCoaches(props: PanelTeamCoachesProps) {
  const { team, canEdit } = props;
  const { notify } = useNotification();
  const [showAddCoachDialog, setShowAddCoachDialog] = useState(false);

  const [addCoach] = useAddCoachToTeamMutation({
    onError: (error) => notify.error('Nepodarilo sa pridať trénera', error.message),
  });
  const [removeCoach] = useRemoveCoachFromTeamMutation({
    onError: (error) => notify.error('Nepodarilo sa odstr8ániť trénera', error.message),
  });

  if (!team) {
    return null;
  }

  return (
    <Panel title="Tréneri">
      <Box gap="small">
        <Box direction="row">
          <Button
            plain
            disabled={!canEdit}
            icon={<Add />}
            label="Pridať trénera"
            onClick={() => setShowAddCoachDialog(true)}
          />
        </Box>
        <CoachList
          canEdit={canEdit}
          coaches={team.coaches ?? []}
          onRemove={(userId) => removeCoach({ variables: { teamId: team.id, userId } })}
        />
      </Box>
      <EditEmailDialog
        show={showAddCoachDialog}
        onClose={() => setShowAddCoachDialog(false)}
        onSubmit={({ email }) =>
          addCoach({ variables: { teamId: team.id, username: email ?? '0' } })
        }
      />
    </Panel>
  );
}
