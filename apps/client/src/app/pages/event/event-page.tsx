import React from 'react';
import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Button, Markdown, Text } from 'grommet';
import { Close } from 'grommet-icons';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { EditEventDialog } from '../../components/dialogs/edit-event-dialog';
import { ErrorPage } from '../../components/error-page';
import { LabelValue } from '../../components/label-value';
import { ListRow } from '../../components/list-row';
import { Panel } from '../../components/panel';
import { UserTags } from '../../components/user-tags';
import {
  useAddEventManagerMutation,
  useGetEventQuery,
  useRemoveEventManagerMutation,
  useUnregisterTeamFromEventMutation,
  useUpdateEventMutation,
} from '../../generated/graphql';

export function EventPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin, isEventManager } = useAppUser();

  const {
    data: eventData,
    loading: eventLoading,
    error: eventError,
  } = useGetEventQuery({ variables: { id: id ?? '0' } });

  const [showEventEditDialog, setShowEventEditDialog] = useState(false);

  const [updateEvent] = useUpdateEventMutation();
  const [addManager] = useAddEventManagerMutation();
  const [removeManager] = useRemoveEventManagerMutation();
  const [unregisterTeam] = useUnregisterTeamFromEventMutation();

  if (!id || eventError) {
    return <ErrorPage title="Chyba pri nahrávaní turnaja." />;
  }

  const event = eventData?.getEvent;
  const canEdit = isAdmin() || isEventManager(id);

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
            <LabelValue label="Dátum turnaja" labelWidth="150px" value={formatDate(event?.date)} />
            <LabelValue label="Podmienky" labelWidth="150px">
              <Box background="light-2" flex pad="small">
                <Markdown>{event?.conditions ?? ''}</Markdown>
              </Box>
            </LabelValue>
            <LabelValue
              label="Termín registrácie"
              labelWidth="150px"
              value={formatDate(event?.registrationEnd)}
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
        <Panel title="Registrácie">
          <Box direction="row" wrap>
            {eventData?.getEvent?.teams.map((t) => (
              <ListRow
                key={t.id}
                columns="1fr auto"
                onClick={() => navigate(appPath.team(t.id))}
                pad="small"
              >
                <Text>{t.name}</Text>
                <Button
                  plain
                  hoverIndicator
                  icon={<Close size="small" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    unregisterTeam({ variables: { teamId: t.id, eventId: id } });
                  }}
                  disabled={!canEdit}
                />
              </ListRow>
            ))}
          </Box>
        </Panel>
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
      </Box>
      <EditEventDialog
        show={showEventEditDialog}
        event={event}
        onClose={() => setShowEventEditDialog(false)}
        onSubmit={(values) => updateEvent({ variables: { id: id ?? '0', input: { ...values } } })}
      />
    </BasePage>
  );
}