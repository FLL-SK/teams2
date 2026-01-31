import React, { useCallback, useState } from 'react';
import { Box, Button, CheckBox } from 'grommet';
import { BasePage } from '../../components/base-page';
import { ProgramsList } from './components/programs-list';
import { Add } from 'grommet-icons';
import { useNotification } from '../../components/notifications/notification-provider';
import { EditProgramDialog } from '../../components/dialogs/edit-program-dialog';
import {
  CreateProgramDocument,
  CreateProgramMutation,
  CreateProgramMutationVariables,
  GetProgramsDocument,
  GetProgramsQuery,
  GetProgramsQueryVariables,
} from '../../_generated/graphql';
import { useMutation, useQuery } from '@apollo/client/react';
import { useAppUser } from '../../components/app-user/use-app-user';

interface ProgramsPageProps {
  responsiveSize?: string;
}

export function ProgramsPage(props: ProgramsPageProps) {
  const [today] = useState(new Date().toISOString());
  const [showInactivePrograms, setShowInactivePrograms] = useState(false);
  const [showAddProgramDialog, setShowAddProgramDialog] = useState(false);
  const { notify } = useNotification();
  const { isAdmin } = useAppUser();

  const onError = useCallback(() => notify.error('Nepodarilo sa vytvoriť program.'), [notify]);

  const { data, loading, error, refetch } = useQuery<GetProgramsQuery, GetProgramsQueryVariables>(
    GetProgramsDocument,
  );

  const [createProgram] = useMutation<CreateProgramMutation, CreateProgramMutationVariables>(
    CreateProgramDocument,
    {
      onCompleted: () => refetch(),
      onError,
    },
  );

  const programs = data?.getPrograms
    ? [...(data?.getPrograms ?? [])]
        .sort((a, b) => (a.group + a.endDate < b.group + b.endDate ? 1 : -1))
        .filter((p) => showInactivePrograms || (p.endDate > today && !p.deletedOn))
    : undefined;

  return (
    <BasePage title="Programy" loading={loading}>
      <Box gap="medium">
        <Box direction="row" justify="between">
          <Button
            icon={<Add />}
            onClick={() => setShowAddProgramDialog(true)}
            label="Nový program"
            disabled={!isAdmin()}
          />
          <CheckBox
            label="Zobraziť neaktívne programy"
            toggle
            checked={showInactivePrograms}
            onChange={() => setShowInactivePrograms(!showInactivePrograms)}
          />
        </Box>
        <ProgramsList programs={programs} />
      </Box>
      <EditProgramDialog
        show={showAddProgramDialog}
        program={undefined}
        onClose={() => setShowAddProgramDialog(false)}
        onSubmit={(values) => createProgram({ variables: { input: { ...values } } })}
      />
    </BasePage>
  );
}
