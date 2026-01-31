import { Box, Button } from 'grommet';
import { Add } from 'grommet-icons';
import React, { useState } from 'react';
import { EditEmailDialog } from '../../../components/dialogs/edit-email-dialog';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import {
  TeamFragmentFragment,
  AddCoachToTeamDocument,
  AddCoachToTeamMutation,
  AddCoachToTeamMutationVariables,
  RemoveCoachFromTeamDocument,
  RemoveCoachFromTeamMutation,
  RemoveCoachFromTeamMutationVariables,
} from '../../../_generated/graphql';
import { useMutation } from '@apollo/client/react';
import { CoachList } from './coach-list';

interface PanelTeamCoachesProps {
  team: TeamFragmentFragment;
  canEdit: boolean;
}

export function PanelTeamCoaches(props: PanelTeamCoachesProps) {
  const { team, canEdit } = props;
  const { notify } = useNotification();
  const [showAddCoachDialog, setShowAddCoachDialog] = useState(false);

  const [addCoach] = useMutation<AddCoachToTeamMutation, AddCoachToTeamMutationVariables>(AddCoachToTeamDocument, {
    onError: (error) => notify.error('Nepodarilo sa pridať trénera', error.message),
  });
  const [removeCoach] = useMutation<RemoveCoachFromTeamMutation, RemoveCoachFromTeamMutationVariables>(RemoveCoachFromTeamDocument, {
    onError: (error) => notify.error('Nepodarilo sa odstr8ániť trénera', error.message),
  });

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
        title="Pridať trénera"
        show={showAddCoachDialog}
        onClose={() => setShowAddCoachDialog(false)}
        onSubmit={({ email }) => addCoach({ variables: { teamId: team.id, username: email } })}
      />
    </Panel>
  );
}
