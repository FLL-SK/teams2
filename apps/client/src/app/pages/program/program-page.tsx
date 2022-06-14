import React from 'react';
import { Box, Button, CheckBox, Markdown } from 'grommet';
import { useCallback, useMemo, useState } from 'react';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { EditEventDialog } from '../../components/dialogs/edit-event-dialog';
import { EditProgramDialog } from '../../components/dialogs/edit-program-dialog';
import { LabelValue } from '../../components/label-value';
import { Panel, PanelGroup } from '../../components/panel';

import { UserTags } from '../../components/user-tags';
import {
  EventListFragmentFragment,
  useAddProgramManagerMutation,
  useCreateEventMutation,
  useDeleteEventMutation,
  useGetProgramQuery,
  useRemoveProgramManagerMutation,
  useUpdateProgramMutation,
} from '../../generated/graphql';
import { EventList } from '../../components/event-list';
import { ErrorPage } from '../../components/error-page';
import { InvoiceItemList } from '../../components/invoice-item-list';
import { useParams } from 'react-router-dom';

export function ProgramPage() {
  const { id } = useParams();

  const { data, loading, error, refetch } = useGetProgramQuery({ variables: { id: id ?? '0' } });

  const [showProgramEditDialog, setShowProgramEditDialog] = useState(false);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const [updateProgram] = useUpdateProgramMutation();
  const [addManager] = useAddProgramManagerMutation();
  const [removeManager] = useRemoveProgramManagerMutation();

  const [createEvent] = useCreateEventMutation({ onCompleted: () => refetch() });
  const [deleteEvent] = useDeleteEventMutation({ onCompleted: () => refetch() });

  const { isProgramManager, isAdmin } = useAppUser();

  const program = data?.getProgram;
  const canEdit: boolean = isProgramManager(program?.id) || isAdmin();
  const canAddManagers: boolean = isProgramManager(program?.id) || isAdmin();

  const today = useMemo(() => new Date().toISOString().substring(0, 10), []);

  const events = useMemo(
    () =>
      (program?.events ?? []).filter(
        (event) =>
          !event.deletedOn &&
          (!event.date || showInactive || (event.date ?? '').substring(0, 10) >= today)
      ),
    [program, showInactive, today]
  );

  const handleDeleteEvent = useCallback(
    async (e: EventListFragmentFragment) => {
      if (e.teamsIds.length === 0) {
        deleteEvent({ variables: { id: e.id } });
      }
      //FIXME - nicer alerting
      alert('Nie je možné vymazať turnaj, na ktorý je prihlásený jeden alebo viac tímov.');
    },
    [deleteEvent]
  );

  if (!id || error) {
    return <ErrorPage title="Program nenájdený" />;
  }

  return (
    <BasePage title="Program" loading={loading}>
      <PanelGroup>
        <Panel title="Detaily programu" gap="medium">
          <LabelValue label="Názov" labelWidth="150px" value={program?.name} />
          <LabelValue label="Popis" labelWidth="150px">
            <Box background="light-2" flex pad="small">
              <Markdown>{program?.description ?? ''}</Markdown>
            </Box>
          </LabelValue>
          <Box direction="row">
            <Button
              label="Zmeniť"
              onClick={() => setShowProgramEditDialog(true)}
              disabled={!canEdit}
            />
          </Box>
        </Panel>

        <Panel title="Faktúra" gap="medium">
          <InvoiceItemList items={program?.invoiceItems ?? []} />
        </Panel>

        {canEdit && (
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
        )}

        <Panel title="Turnaje" gap="medium">
          <Box direction="row" justify="between">
            <Box>
              <Button
                label="Pridať turnaj"
                onClick={() => setShowAddEventDialog(true)}
                disabled={!canEdit}
              />
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
          <EventList events={events} onRemove={canEdit ? handleDeleteEvent : undefined} />
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
