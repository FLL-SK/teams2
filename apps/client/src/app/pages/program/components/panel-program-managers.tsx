import { Box } from 'grommet';
import React from 'react';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import { UserTags } from '../../../components/user-tags';
import {
  ProgramFragmentFragment,
  useAddProgramManagerMutation,
  useRemoveProgramManagerMutation,
} from '../../../generated/graphql';

interface PanelProgramManagersProps {
  program: ProgramFragmentFragment;
  canAddManagers: boolean;
}

export function PanelProgramManagers(props: PanelProgramManagersProps) {
  const { program, canAddManagers } = props;
  const { notify } = useNotification();

  const [addManager] = useAddProgramManagerMutation({
    onError: () => notify.error('Nepodarilo sa pridať manažéra.'),
  });
  const [removeManager] = useRemoveProgramManagerMutation({
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
