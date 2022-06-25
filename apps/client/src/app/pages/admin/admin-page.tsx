import React from 'react';
import { Box, Button, Spinner } from 'grommet';
import { Add } from 'grommet-icons';
import { useState } from 'react';

import { BasePage } from '../../components/base-page';
import { EditProgramDialog } from '../../components/dialogs/edit-program-dialog';
import { Panel, PanelGroup } from '../../components/panel';
import {
  useCreateProgramMutation,
  useGetProgramsQuery,
  useGetTeamsQuery,
} from '../../generated/graphql';
import { ProgramsList } from './programs-list';
import { useAppUser } from '../../components/app-user/use-app-user';
import { ErrorPage } from '../../components/error-page';
import { TeamsList } from './teams-list';

export function AdminPage() {
  const [showAddProgramDialog, setShowAddProgramDialog] = useState(false);
  const { user, loading } = useAppUser();

  const {
    data: programsData,
    loading: programsLoading,
    refetch: refetchPrograms,
  } = useGetProgramsQuery();

  const { data: teamsData, loading: teamsLoading, refetch: refetchTeams } = useGetTeamsQuery();

  const [createProgram] = useCreateProgramMutation({ onCompleted: () => refetchPrograms() });

  if (!loading && !user?.isAdmin) {
    return <ErrorPage title="Nemáte oprávnenie." />;
  }

  return (
    <BasePage title="Admin" loading={loading}>
      <PanelGroup>
        <Panel title="Programy" gap="medium">
          <Box direction="row">
            <Button
              primary
              icon={<Add />}
              onClick={() => setShowAddProgramDialog(true)}
              label="Nový program"
            />
          </Box>
          {programsLoading ? (
            <Spinner />
          ) : (
            <ProgramsList programs={programsData?.getPrograms ?? []} />
          )}
        </Panel>
        <Panel title="Tímy">
          {teamsLoading ? <Spinner /> : <TeamsList teams={teamsData?.getTeams ?? []} />}
        </Panel>
      </PanelGroup>

      <EditProgramDialog
        show={showAddProgramDialog}
        program={undefined}
        onClose={() => setShowAddProgramDialog(false)}
        onSubmit={(values) => createProgram({ variables: { input: { ...values } } })}
      />
    </BasePage>
  );
}
