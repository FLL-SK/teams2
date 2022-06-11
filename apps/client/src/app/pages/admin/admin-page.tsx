import { appPath } from '@teams2/common';
import { Box, Button, Spinner } from 'grommet';
import { Add } from 'grommet-icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { EditProgramDialog } from '../../components/dialogs/edit-program-dialog';
import { Panel, PanelGroup } from '../../components/panel';
import { useCreateProgramMutation, useGetProgramsQuery } from '../../generated/graphql';
import { ProgramsList } from './programs-list';
import { useAppUser } from '../../components/app-user/use-app-user';

export function AdminPage() {
  const navigate = useNavigate();
  const [navLink, setNavLink] = useState<string>();
  const [showAddProgramDialog, setShowAddProgramDialog] = useState(false);
  const { user, loading } = useAppUser();

  const {
    data: programsData,
    loading: programsLoading,
    refetch: refetchPrograms,
  } = useGetProgramsQuery();
  const [createProgram] = useCreateProgramMutation({ onCompleted: () => refetchPrograms() });

  useEffect(() => {
    if (navLink) {
      navigate(navLink);
    }
    return () => {
      setNavLink(undefined);
    };
  }, [navLink, navigate]);

  if (!loading && !user?.isAdmin) {
    if (!navLink) {
      setNavLink(appPath.page404);
    }
  }

  return (
    <BasePage title="Admin" loading={loading}>
      <PanelGroup>
        <Panel title="Programy">
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
