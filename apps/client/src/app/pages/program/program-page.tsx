import { appPath } from '@teams2/common';
import { Box, Button } from 'grommet';
import { Add } from 'grommet-icons';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { useAuthenticate } from '../../components/auth/useAuthenticate';
import { BasePage } from '../../components/base-page';
import { EditProgramDialog } from '../../components/dialogs/edit-program-dialog';
import { LabelValue } from '../../components/label-value';
import { Panel, PanelGroup } from '../../components/panel';
import { SelectUser } from '../../components/select-user';
import { Tag } from '../../components/tag';
import {
  useAddProgramManagerMutation,
  useGetProgramLazyQuery,
  useRemoveProgramManagerMutation,
  useUpdateProgramMutation,
} from '../../generated/graphql';

export function ProgramPage() {
  const navigate = useNavigate();
  const [getProgram, { data, loading, error }] = useGetProgramLazyQuery();
  const [navLink, setNavLink] = useState<string>();
  const [showProgramEditDialog, setShowProgramEditDialog] = useState(false);
  const [showAddManagerDialog, setShowAddManagerDialog] = useState(false);

  const [updateProgram] = useUpdateProgramMutation();
  const [addManager] = useAddProgramManagerMutation();
  const [removeManager] = useRemoveProgramManagerMutation();

  const { isProgramManager, isAdmin } = useAppUser();

  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getProgram({ variables: { id } });
    }
  }, [getProgram, id]);

  useEffect(() => {
    if (navLink) {
      navigate(navLink);
    }
    return () => {
      setNavLink(undefined);
    };
  }, [navLink, navigate]);

  if ((!id || error) && !navLink) {
    setNavLink(appPath.page404);
  }

  const program = data?.getProgram;
  const canEdit = isProgramManager(program?.id) || isAdmin;
  const canAddManagers = isProgramManager(program?.id) || isAdmin;

  return (
    <BasePage title="Program" loading={loading}>
      <PanelGroup>
        <Panel title="Detaily programu">
          <Box gap="medium">
            <LabelValue label="Názov" labelWidth="150px" value={program?.name} />
            <LabelValue label="Popis" labelWidth="150px" value={program?.description} />
            <Box direction="row">
              <Button
                label="Zmeniť"
                onClick={() => setShowProgramEditDialog(true)}
                disabled={!canEdit}
              />
            </Box>
          </Box>
        </Panel>

        <Panel title="Manažéri">
          <Box direction="row" wrap>
            {data?.getProgram?.managers.map((m) => (
              <Tag
                key={m.id}
                onClick={() => setNavLink(appPath.profile(m.id))}
                value={m.name.length > 0 ? m.name : m.username}
                onRemove={() =>
                  removeManager({ variables: { programId: id ?? '0', userId: m.id } })
                }
              />
            ))}

            {showAddManagerDialog ? (
              <SelectUser
                onClose={() => setShowAddManagerDialog(false)}
                onSelect={(user) =>
                  addManager({ variables: { programId: id ?? '0', userId: user.id } })
                }
              />
            ) : (
              <Button
                plain
                icon={<Add />}
                label="Pridať manažéra"
                onClick={() => setShowAddManagerDialog(true)}
                disabled={!canAddManagers}
              />
            )}
          </Box>
        </Panel>

        <Panel title="Turnaje">
          <p>Here be details</p>
        </Panel>
      </PanelGroup>
      <EditProgramDialog
        show={showProgramEditDialog}
        program={data?.getProgram}
        onClose={() => setShowProgramEditDialog(false)}
        onSubmit={(values) => updateProgram({ variables: { id: id ?? '0', input: values } })}
      />
    </BasePage>
  );
}
