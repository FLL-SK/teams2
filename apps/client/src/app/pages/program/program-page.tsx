import React from 'react';
import { Box, Button, CheckBox, Markdown, Text } from 'grommet';
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
  InvoiceItemFragmentFragment,
  useAddProgramManagerMutation,
  useCreateEventMutation,
  useCreateProgramInvoiceItemMutation,
  useDeleteEventMutation,
  useDeleteProgramInvoiceItemMutation,
  useGetProgramQuery,
  useRemoveProgramManagerMutation,
  useUpdateProgramInvoiceItemMutation,
  useUpdateProgramMutation,
} from '../../generated/graphql';
import { EventList } from '../../components/event-list';
import { ErrorPage } from '../../components/error-page';
import { InvoiceItemList } from '../../components/invoice-item-list';
import { useParams } from 'react-router-dom';
import { EditInvoiceItemDialog } from '../../components/dialogs/edit-invoice-item-dialog';
import { omit } from 'lodash';

export function ProgramPage() {
  const { id } = useParams();

  const { data, loading, error, refetch } = useGetProgramQuery({ variables: { id: id ?? '0' } });

  const [showProgramEditDialog, setShowProgramEditDialog] = useState(false);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [invoiceItemEdit, setInvoiceItemEdit] = useState<InvoiceItemFragmentFragment>();
  const [invoiceItemAdd, setInvoiceItemAdd] = useState<boolean>(false);

  const [updateProgram] = useUpdateProgramMutation();
  const [addManager] = useAddProgramManagerMutation();
  const [removeManager] = useRemoveProgramManagerMutation();

  const [createEvent] = useCreateEventMutation({ onCompleted: () => refetch() });
  const [deleteEvent] = useDeleteEventMutation({ onCompleted: () => refetch() });

  const [createInvoiceItem] = useCreateProgramInvoiceItemMutation({ onCompleted: () => refetch() });
  const [updateInvoiceItem] = useUpdateProgramInvoiceItemMutation({ onCompleted: () => refetch() });
  const [deleteInvoiceItem] = useDeleteProgramInvoiceItemMutation({ onCompleted: () => refetch() });

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
      if (e.eventTeams.length === 0) {
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

  const invoiceItems = program?.invoiceItems ?? [];

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
          <LabelValue label="Podmienky" labelWidth="150px">
            <Box background="light-2" flex pad="small">
              <Markdown>{program?.conditions ?? ''}</Markdown>
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

        <Panel title="Poplatky" gap="medium">
          {invoiceItems.length === 0 && <Text>Tento program je organizovaný bezplatne.</Text>}
          {invoiceItems.length > 0 && (
            <InvoiceItemList
              items={invoiceItems}
              onRemove={(i) =>
                deleteInvoiceItem({ variables: { programId: id ?? '0', itemId: i.id } })
              }
              onClick={(item) => setInvoiceItemEdit(item)}
              editable={canEdit}
            />
          )}
          <Box direction="row">
            <Button
              label="Pridať poplatok"
              onClick={() => setInvoiceItemAdd(true)}
              disabled={!canEdit}
            />
          </Box>
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
      <EditInvoiceItemDialog
        show={!!invoiceItemEdit || invoiceItemAdd}
        item={invoiceItemEdit}
        onClose={() => {
          setInvoiceItemAdd(false);
          setInvoiceItemEdit(undefined);
        }}
        onSubmit={(values) => {
          if (invoiceItemAdd) {
            createInvoiceItem({ variables: { programId: id ?? '0', item: omit(values, 'id') } });
          } else {
            updateInvoiceItem({
              variables: { programId: id ?? '0', itemId: values.id ?? '0', item: values },
            });
          }
        }}
      />
    </BasePage>
  );
}
