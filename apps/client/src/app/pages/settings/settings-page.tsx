import React, { useCallback } from 'react';
import { Box, Button, CheckBox, Spinner } from 'grommet';
import { Add } from 'grommet-icons';
import { useState } from 'react';

import { BasePage } from '../../components/base-page';
import { EditProgramDialog } from '../../components/dialogs/edit-program-dialog';
import { Panel, PanelGroup } from '../../components/panel';
import {
  useCreateProgramMutation,
  useGetProgramsQuery,
  useGetSettingsQuery,
} from '../../generated/graphql';
import { ProgramsList } from './components/programs-list';
import { useAppUser } from '../../components/app-user/use-app-user';
import { ErrorPage } from '../../components/error-page';
import { useNotification } from '../../components/notifications/notification-provider';
import { PanelSettings } from './components/panel-settings';

export function SettingsPage() {
  const [showAddProgramDialog, setShowAddProgramDialog] = useState(false);
  const { user, userLoading: loading } = useAppUser();
  const [showInactivePrograms, setShowInactivePrograms] = useState(false);
  const [today] = useState(new Date().toISOString());

  const { notify } = useNotification();
  const onError = useCallback(() => notify.error('Nepodarilo sa vytvoriť program.'), [notify]);

  const {
    data: programsData,
    loading: programsLoading,
    refetch: refetchPrograms,
  } = useGetProgramsQuery();

  const { data: settingsData } = useGetSettingsQuery();

  const [createProgram] = useCreateProgramMutation({
    onCompleted: () => refetchPrograms(),
    onError,
  });

  if (!loading && !user?.isAdmin) {
    return <ErrorPage title="Nemáte oprávnenie." />;
  }

  const programs = [...(programsData?.getPrograms ?? [])]
    .sort((a, b) => (a.endDate < b.endDate ? 1 : -1))
    .filter((p) => showInactivePrograms || (p.endDate > today && !p.deletedOn));

  return (
    <BasePage title="Nastavenia" loading={loading}>
      <PanelGroup>
        <Panel title="Programy" gap="medium">
          <Box direction="row" justify="between">
            <Button
              icon={<Add />}
              onClick={() => setShowAddProgramDialog(true)}
              label="Nový program"
            />
            <CheckBox
              label="Zobraziť neaktívne programy"
              toggle
              checked={showInactivePrograms}
              onChange={() => setShowInactivePrograms(!showInactivePrograms)}
            />
          </Box>
          {programsLoading ? <Spinner /> : <ProgramsList programs={programs} />}
        </Panel>
        <PanelSettings settings={settingsData?.getSettings} />
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
