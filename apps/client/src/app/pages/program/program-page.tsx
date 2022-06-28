import React from 'react';
import { Box, Button, CheckBox, FileInput, Markdown, Text } from 'grommet';
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
  FileUploadInput,
  InvoiceItemFragmentFragment,
  useAddProgramFileMutation,
  useAddProgramManagerMutation,
  useCreateEventMutation,
  useCreateProgramInvoiceItemMutation,
  useDeleteEventMutation,
  useDeleteProgramInvoiceItemMutation,
  useGetProgramFilesQuery,
  useGetProgramFileUploadUrlLazyQuery,
  useGetProgramQuery,
  useRemoveFileMutation,
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
import { FileTile } from '../../components/file-tile';
import { FileUploadControl } from '../../components/file-upload-control';
import { uploadS3XHR } from '../../utils/upload-s3-xhr';
import { formatDate } from '@teams2/dateutils';

const labelWidth = '150px';

export function ProgramPage() {
  const { id } = useParams();

  const {
    data: programData,
    loading: programLoading,
    error,
    refetch: programRefetch,
  } = useGetProgramQuery({ variables: { id: id ?? '0' } });

  const {
    data: filesData,
    loading: filesLoading,
    refetch: filesRefetch,
  } = useGetProgramFilesQuery({
    variables: { programId: id ?? '0' },
    pollInterval: 600000, // get updated urls before they expire
  });

  const [getUploadUrl] = useGetProgramFileUploadUrlLazyQuery();

  const [showProgramEditDialog, setShowProgramEditDialog] = useState(false);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [invoiceItemEdit, setInvoiceItemEdit] = useState<InvoiceItemFragmentFragment>();
  const [invoiceItemAdd, setInvoiceItemAdd] = useState<boolean>(false);

  const [updateProgram] = useUpdateProgramMutation();
  const [addManager] = useAddProgramManagerMutation();
  const [removeManager] = useRemoveProgramManagerMutation();

  const [createEvent] = useCreateEventMutation({ onCompleted: () => programRefetch() });
  const [deleteEvent] = useDeleteEventMutation({ onCompleted: () => programRefetch() });

  const [createInvoiceItem] = useCreateProgramInvoiceItemMutation({
    onCompleted: () => programRefetch(),
  });
  const [updateInvoiceItem] = useUpdateProgramInvoiceItemMutation({
    onCompleted: () => programRefetch(),
  });
  const [deleteInvoiceItem] = useDeleteProgramInvoiceItemMutation({
    onCompleted: () => programRefetch(),
  });

  const [addProgramFile] = useAddProgramFileMutation({ onCompleted: () => filesRefetch() });
  const [removeFile] = useRemoveFileMutation({ onCompleted: () => filesRefetch() });

  const { isProgramManager, isAdmin } = useAppUser();

  const program = programData?.getProgram;
  const files = filesData?.getProgramFiles ?? [];
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

  const handleFileUpload = useCallback(
    async (files: FileList) => {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        console.log('fetching upload url for ', f);
        const ff: FileUploadInput = { name: f.name, size: f.size, type: f.type };
        getUploadUrl({
          variables: { programId: id ?? '0', input: ff },
          onCompleted: async (data) => {
            console.log('Uploading to ', data.getProgramFileUploadUrl);
            if (await uploadS3XHR(f, data.getProgramFileUploadUrl)) {
              addProgramFile({ variables: { programId: id ?? '0', input: ff } });
            }

            //TODO statu/result notification
          },
        });
      }
    },
    [addProgramFile, getUploadUrl, id]
  );

  if (!id || error) {
    return <ErrorPage title="Program nenájdený" />;
  }

  const invoiceItems = program?.invoiceItems ?? [];

  return (
    <BasePage title="Program" loading={programLoading}>
      <PanelGroup>
        <Panel title="Detaily programu" gap="medium">
          <LabelValue label="Názov" labelWidth={labelWidth} value={program?.name} />
          <LabelValue
            label="Začiatok"
            labelWidth={labelWidth}
            value={formatDate(program?.startDate)}
          />
          <LabelValue label="Koniec" labelWidth={labelWidth} value={formatDate(program?.endDate)} />
          <LabelValue label="Popis" labelWidth={labelWidth}>
            <Box background="light-2" flex pad="small">
              <Markdown>{program?.description ?? ''}</Markdown>
            </Box>
          </LabelValue>
          <LabelValue label="Podmienky" labelWidth={labelWidth}>
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

        <Panel title="Súbory" gap="small">
          {files.map((f) => (
            <FileTile
              key={f.id}
              file={f}
              readOnly={!canEdit}
              onDelete={(f) => removeFile({ variables: { fileId: f.id } })}
            />
          ))}
          {canEdit && <FileUploadControl onUpload={handleFileUpload} />}
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
        program={programData?.getProgram}
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
