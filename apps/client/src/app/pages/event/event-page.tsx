import React from 'react';
import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Button, Markdown, Text } from 'grommet';
import { useState } from 'react';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { EditEventDialog } from '../../components/dialogs/edit-event-dialog';
import { ErrorPage } from '../../components/error-page';
import { LabelValue } from '../../components/label-value';
import { ListRow } from '../../components/list-row';
import { Panel } from '../../components/panel';
import { UserTags } from '../../components/user-tags';
import {
  InvoiceItemFragmentFragment,
  TeamListFragmentFragment,
  useAddEventManagerMutation,
  useCreateEventInvoiceItemMutation,
  useDeleteEventInvoiceItemMutation,
  useGetEventQuery,
  useRemoveEventManagerMutation,
  useSwitchTeamEventMutation,
  useUnregisterTeamFromEventMutation,
  useUpdateEventInvoiceItemMutation,
  useUpdateEventMutation,
} from '../../generated/graphql';
import { BasicDialog } from '../../components/dialogs/basic-dialog';
import { InvoiceItemList } from '../../components/invoice-item-list';
import { EditInvoiceItemDialog } from '../../components/dialogs/edit-invoice-item-dialog';
import { omit } from 'lodash';
import { TeamMenu } from './team-menu';
import { ChangeTeamEventDialog } from '../../components/dialogs/change-team-event-dialog';
import { useParams } from 'react-router-dom';
import { fullAddress } from '../../utils/format-address';
import { Group } from 'grommet-icons';

export function EventPage() {
  const { id } = useParams();
  const { isAdmin, isEventManager } = useAppUser();
  const [teamToUnregister, setTeamToUnregister] = useState<TeamListFragmentFragment>();
  const [teamToSwitch, setTeamToSwitch] = useState<TeamListFragmentFragment>();
  const [invoiceItemEdit, setInvoiceItemEdit] = useState<InvoiceItemFragmentFragment>();
  const [invoiceItemAdd, setInvoiceItemAdd] = useState<boolean>(false);

  const {
    data: eventData,
    loading: eventLoading,
    error: eventError,
    refetch,
  } = useGetEventQuery({ variables: { id: id ?? '0' } });

  const [showEventEditDialog, setShowEventEditDialog] = useState(false);

  const [updateEvent] = useUpdateEventMutation();
  const [addManager] = useAddEventManagerMutation();
  const [removeManager] = useRemoveEventManagerMutation();
  const [unregisterTeam] = useUnregisterTeamFromEventMutation();
  const [switchTeamEvent] = useSwitchTeamEventMutation();

  const [createInvoiceItem] = useCreateEventInvoiceItemMutation({ onCompleted: () => refetch() });
  const [updateInvoiceItem] = useUpdateEventInvoiceItemMutation({ onCompleted: () => refetch() });
  const [deleteInvoiceItem] = useDeleteEventInvoiceItemMutation({ onCompleted: () => refetch() });

  if (!id || eventError) {
    return <ErrorPage title="Chyba pri nahrávaní turnaja." />;
  }

  const event = eventData?.getEvent;
  const canEdit = isAdmin() || isEventManager(id);
  const invoiceItems = event?.invoiceItems ?? [];
  const eventTeams = [...(eventData?.getEvent.registrations ?? [])].sort((a, b) =>
    a.team.name < b.team.name ? -1 : 1
  );

  return (
    <BasePage title="Turnaj" loading={eventLoading}>
      <Box gap="medium">
        <Panel title="Detaily turnaja">
          <Box gap="medium">
            <LabelValue label="Program" labelWidth="150px">
              <Text>
                <Anchor label={event?.program.name} href={appPath.program(event?.programId)} />
              </Text>
            </LabelValue>
            <LabelValue label="Názov" labelWidth="150px" value={event?.name} />
            <LabelValue
              label="Dátum turnaja"
              labelWidth="150px"
              value={event?.date ? formatDate(event?.date) : 'neurčený'}
            />
            <LabelValue label="Podmienky" labelWidth="150px">
              <Box background="light-2" flex pad="small">
                <Markdown>{event?.conditions ?? ''}</Markdown>
              </Box>
            </LabelValue>
            <LabelValue
              label="Termín registrácie"
              labelWidth="150px"
              value={formatDate(event?.registrationEnd ? event?.registrationEnd : 'neurčený')}
            />

            <Box direction="row">
              <Button
                label="Zmeniť"
                onClick={() => setShowEventEditDialog(true)}
                disabled={!canEdit}
              />
            </Box>
          </Box>
        </Panel>

        <Panel title="Poplatky" gap="medium">
          {invoiceItems.length === 0 && (
            <Text>
              Tento turnaj preberá poplatky z programu v rámci ktorého je organizovaný. Pridaním
              poplatku je možné definovať poplatky špecifické pre tento turnaj.
            </Text>
          )}
          {invoiceItems.length > 0 && (
            <InvoiceItemList
              items={invoiceItems}
              onRemove={(i) =>
                deleteInvoiceItem({ variables: { eventId: id ?? '0', itemId: i.id } })
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

        <Panel title="Tímy">
          <Box direction="row" wrap>
            {eventTeams.map((t, idx) => (
              <ListRow key={t.id} columns="50px 1fr 80px auto" pad="small" align="center">
                <Text>{idx + 1}</Text>
                <Box>
                  <Text>{t.team.name}</Text>
                  <Text size="small">{fullAddress(t.team.address)}</Text>
                </Box>
                <Box direction="row" gap="small">
                  <Group />
                  <Text>
                    {t.teamSize}
                    {!t.sizeConfirmedOn && ' ?'}
                  </Text>
                </Box>

                <Box width="50px" justify="end">
                  <TeamMenu
                    team={t.team}
                    onUnregister={(tt) => setTeamToUnregister(tt)}
                    onChangeEvent={(tt) => setTeamToSwitch(tt)}
                    canEdit={canEdit}
                  />
                </Box>
              </ListRow>
            ))}
          </Box>
        </Panel>

        {canEdit && (
          <Panel title="Manažéri">
            <Box direction="row" wrap>
              <UserTags
                users={event?.managers ?? []}
                onAdd={(userId) => addManager({ variables: { eventId: id ?? '0', userId } })}
                onRemove={(userId) => removeManager({ variables: { eventId: id ?? '0', userId } })}
                canEdit={canEdit}
              />
            </Box>
          </Panel>
        )}
      </Box>

      <EditEventDialog
        show={showEventEditDialog}
        event={event}
        onClose={() => setShowEventEditDialog(false)}
        onSubmit={(values) => updateEvent({ variables: { id: id ?? '0', input: { ...values } } })}
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
            createInvoiceItem({ variables: { eventId: id ?? '0', item: omit(values, 'id') } });
          } else {
            updateInvoiceItem({
              variables: { eventId: id ?? '0', itemId: values.id ?? '0', item: values },
            });
          }
        }}
      />

      <ChangeTeamEventDialog
        show={!!teamToSwitch}
        team={teamToSwitch}
        event={event}
        onClose={() => setTeamToSwitch(undefined)}
        onSubmit={(e) =>
          switchTeamEvent({
            variables: {
              teamId: teamToSwitch?.id ?? '0',
              oldEventId: event?.id ?? '0',
              newEventId: e.id,
            },
          })
        }
      />

      <BasicDialog
        show={!!teamToUnregister}
        onClose={() => setTeamToUnregister(undefined)}
        title="Odhlásiť tím z turnaja?"
      >
        <Box gap="medium">
          <Text alignSelf="center">{`Naozaj chcete odhlásiť tím ${teamToUnregister?.name} z turnaja?`}</Text>
          <Box direction="row" justify="evenly">
            <Button label="Nie" primary onClick={() => setTeamToUnregister(undefined)} />
            <Button
              label="Áno"
              onClick={async (e) => {
                e.stopPropagation();
                await unregisterTeam({
                  variables: { teamId: teamToUnregister?.id ?? '0', eventId: id },
                });
                setTeamToUnregister(undefined);
              }}
            />
          </Box>
        </Box>
      </BasicDialog>
    </BasePage>
  );
}
