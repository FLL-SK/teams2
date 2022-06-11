import { appPath } from '@teams2/common';
import { Box, Button, CheckBox } from 'grommet';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { EditEventDialog } from '../../components/dialogs/edit-event-dialog';
import { EditProgramDialog } from '../../components/dialogs/edit-program-dialog';
import { LabelValue } from '../../components/label-value';
import { Panel, PanelGroup } from '../../components/panel';

import { UserTags } from '../../components/user-tags';
import {
  useAddProgramManagerMutation,
  useCreateEventMutation,
  useGetProgramLazyQuery,
  useRemoveProgramManagerMutation,
  useUpdateProgramMutation,
} from '../../generated/graphql';
import { EventsList } from '../../components/events-list';

export function ProgramPage() {
  const navigate = useNavigate();
  const [getProgram, { data, loading, error, refetch }] = useGetProgramLazyQuery();
  const [navLink, setNavLink] = useState<string>();
  const [showProgramEditDialog, setShowProgramEditDialog] = useState(false);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [updateProgram] = useUpdateProgramMutation();
  const [addManager] = useAddProgramManagerMutation();
  const [removeManager] = useRemoveProgramManagerMutation();
  const [createEvent] = useCreateEventMutation({ onCompleted: () => refetch() });

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
  const canEdit: boolean = isProgramManager(program?.id) || isAdmin();
  const canAddManagers: boolean = isProgramManager(program?.id) || isAdmin();

  const today = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const events = (program?.events ?? []).filter(
    (event) =>
      !event.deletedOn &&
      (!event.date || showInactive || (event.date ?? '').substring(0, 10) >= today)
  );

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
            <UserTags
              users={program?.managers ?? []}
              onAdd={(userId) =>
                addManager({ variables: { programId: program?.id ?? '0', userId } })
              }
              onRemove={(userId) =>
                removeManager({ variables: { programId: program?.id ?? '0', userId } })
              }
              canEdit={canAddManagers}
            />
          </Box>
        </Panel>

        <Panel title="Turnaje">
          <Box direction="row" justify="between">
            <Box>
              <Button label="Pridať turnaj" onClick={() => setShowAddEventDialog(true)} />
            </Box>
            <Box>
              <CheckBox
                toggle
                label="Zobraziť aj neaktívne"
                defaultChecked={showInactive}
                onChange={({ target }) => setShowInactive(target.checked)}
              />
            </Box>
          </Box>
          <EventsList events={events} />
        </Panel>
      </PanelGroup>
      <EditProgramDialog
        show={showProgramEditDialog}
        program={data?.getProgram}
        onClose={() => setShowProgramEditDialog(false)}
        onSubmit={(values) => updateProgram({ variables: { id: id ?? '0', input: values } })}
      />
      <EditEventDialog
        show={showAddEventDialog}
        onClose={() => setShowAddEventDialog(false)}
        onSubmit={(values) =>
          createEvent({ variables: { input: { ...values, programId: id ?? '0' } } })
        }
      />
    </BasePage>
  );
}
