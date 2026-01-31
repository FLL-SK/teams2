import { Box } from 'grommet';
import React from 'react';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import { UserTags } from '../../../components/user-tags';
import {
  ProgramFragmentFragment,
  AddProgramManagerDocument,
  AddProgramManagerMutation,
  AddProgramManagerMutationVariables,
  RemoveProgramManagerDocument,
  RemoveProgramManagerMutation,
  RemoveProgramManagerMutationVariables,
} from '../../../_generated/graphql';
import { useMutation } from '@apollo/client/react';

interface PanelProgramManagersProps {
  program: ProgramFragmentFragment;
  canAddManagers: boolean;
}

export function PanelProgramManagers(props: PanelProgramManagersProps) {
  const { program, canAddManagers } = props;
  const { notify } = useNotification();

  const [addManager] = useMutation<AddProgramManagerMutation, AddProgramManagerMutationVariables>(AddProgramManagerDocument, {
    onError: () => notify.error('Nepodarilo sa pridať manažéra.'),
  });
  const [removeManager] = useMutation<RemoveProgramManagerMutation, RemoveProgramManagerMutationVariables>(RemoveProgramManagerDocument, {
    onError: () => notify.error('Nepodarilo sa odstrániť manažéra.'),
  });

  return (
    <Panel title="Manažéri">
      <Box direction="row" wrap>
        <UserTags
          users={program.managers ?? []}
          onAdd={(userId) => addManager({ variables: { programId: program.id, userId } })}
          onRemove={(userId) => removeManager({ variables: { programId: program.id, userId } })}
          canEdit={canAddManagers}
        />
      </Box>
    </Panel>
  );
}
