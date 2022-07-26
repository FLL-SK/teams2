import React, { useMemo } from 'react';
import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Button, Markdown, Text } from 'grommet';
import { useState } from 'react';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { EditEventDialog } from '../../components/dialogs/edit-event-dialog';
import { ErrorPage } from '../../components/error-page';
import { LabelValue } from '../../components/label-value';
import { ListRow2 } from '../../components/list-row';
import { Panel } from '../../components/panel';
import { UserTags } from '../../components/user-tags';
import {
  InvoiceItemFragmentFragment,
  TeamBasicFragmentFragment,
  useAddEventManagerMutation,
  useCreateInvoiceItemMutation,
  useDeleteInvoiceItemMutation,
  useGetEventQuery,
  useRemoveEventManagerMutation,
  useSwitchTeamEventMutation,
  useUnregisterTeamFromEventMutation,
  useUpdateInvoiceItemMutation,
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
import { LabelValueGroup } from '../../components/label-value-group';
import { formatTeamSize } from '../../utils/format-teamsize';

export function EventPage() {
  const { id } = useParams();
  const { isAdmin, isEventManager } = useAppUser();
  const [teamToUnregister, setTeamToUnregister] = useState<TeamBasicFragmentFragment>();
  const [teamToSwitch, setTeamToSwitch] = useState<TeamBasicFragmentFragment>();
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

  const [createInvoiceItem] = useCreateInvoiceItemMutation({ onCompleted: () => refetch() });
  const [updateInvoiceItem] = useUpdateInvoiceItemMutation({ onCompleted: () => refetch() });
  const [deleteInvoiceItem] = useDeleteInvoiceItemMutation({ onCompleted: () => refetch() });

  const event = eventData?.getEvent;
  const canEdit = isAdmin() || isEventManager(id);
  const invoiceItems = event?.invoiceItems ?? [];
  const eventRegs = useMemo(
    () =>
      [...(eventData?.getEvent.registrations ?? [])].sort((a, b) =>
        a.team.name < b.team.name ? -1 : 1
      ),
    [eventData]
  );

  if (!id || (eventError && !eventLoading)) {
    return <ErrorPage title="Chyba pri nahrávaní turnaja." />;
  }

  return (
    <BasePage title="Turnaj" loading={eventLoading}>
      <Box gap="medium">
        <Panel title="Detaily turnaja">
          <Box gap="medium">
            <LabelValueGroup labelWidth="200px" gap="small" direction="row">
              <LabelValue label="Program">
                <Text>
                  <Anchor label={event?.program.name} href={appPath.program(event?.programId)} />
                </Text>
              </LabelValue>
              <LabelValue label="Názov" value={event?.name} />
              <LabelValue
                label="Dátum turnaja"
                value={event?.date ? formatDate(event?.date) : 'neurčený'}
              />
              <LabelValue label="Podmienky">
                <Box background="light-2" flex pad="small">
                  <Markdown>{event?.conditions ?? ''}</Markdown>
                </Box>
              </LabelValue>
              <LabelValue
                label="Koniec registrácie"
                value={event?.registrationEnd ? formatDate(event?.registrationEnd) : 'neurčený'}
              />
            </LabelValueGroup>

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
              onRemove={(i) => deleteInvoiceItem({ variables: { id: i.id } })}
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
            {eventRegs.map((reg, idx) => (
              <ListRow2 key={reg.id} columns="50px 1fr 80px auto" pad="small" align="center">
                <Text>{idx + 1}</Text>
                <Box>
                  <Text>{reg.team.name}</Text>
                  <Text size="small">{fullAddress(reg.team.address)}</Text>
                </Box>
                <Box direction="row" gap="small">
                  <Group />
                  <Text>
                    {formatTeamSize(reg)}
                    {!reg.sizeConfirmedOn && ' ?'}
                  </Text>
                </Box>

                <Box width="50px" justify="end">
                  <TeamMenu
                    team={reg.team}
                    onUnregister={(tt) => setTeamToUnregister(tt)}
                    onChangeEvent={(tt) => setTeamToSwitch(tt)}
                    canEdit={canEdit}
                  />
                </Box>
              </ListRow2>
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
            createInvoiceItem({
              variables: { type: 'event', refId: id ?? '0', item: omit(values, 'id') },
            });
          } else {
            updateInvoiceItem({
              variables: { id: values.id ?? '0', item: values },
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
