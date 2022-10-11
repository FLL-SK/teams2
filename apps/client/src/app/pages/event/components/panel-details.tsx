import { appPath } from '@teams2/common';
import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Button, Markdown, Text } from 'grommet';
import React, { useState, useCallback } from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { EditEventDialog } from '../../../components/dialogs/edit-event-dialog';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { Modal } from '../../../components/modal';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import {
  EventFragmentFragment,
  useDeleteEventMutation,
  useUpdateEventMutation,
} from '../../../generated/graphql';

interface PanelEventDetailsProps {
  event: EventFragmentFragment;
  canEdit?: boolean;
}

export function PanelEventDetails(props: PanelEventDetailsProps) {
  const { event, canEdit } = props;
  const { notify } = useNotification();
  const { isAdmin, isEventManager } = useAppUser();
  const [showEventTerms, setShowEventTerms] = useState<boolean>(false);
  const [showEventEditDialog, setShowEventEditDialog] = useState(false);

  const [updateEvent] = useUpdateEventMutation({
    onError: (e) => notify.error('Nepodarilo sa aktualizovať turnaj', e.message),
  });

  const [deleteEvent] = useDeleteEventMutation({
    onError: (e) => notify.error('Nepodarilo sa odstrániť turnaj.', e.message),
  });

  const handleDeleteEvent = useCallback(() => {
    if (event?.registrationsCount === 0) {
      deleteEvent({ variables: { id: event?.id } });
    } else {
      notify.error('Nie je možné vymazať turnaj, na ktorý je prihlásený jeden alebo viac tímov.');
    }
  }, [deleteEvent, event, notify]);

  if (!event) {
    return null;
  }

  return (
    <Panel title="Detaily turnaja">
      <Box gap="medium">
        <LabelValueGroup labelWidth="250px" gap="small" direction="row">
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
          {(isAdmin() || isEventManager(event.id)) && (
            <LabelValue label="Poplatky turnaja">
              {event?.ownFeesAllowed ? 'áno' : 'nie'}
            </LabelValue>
          )}
          <LabelValue label="Podmienky">
            <Box background="light-2" flex pad="small">
              {(event?.conditions ?? '').length > 0 ? (
                <>
                  <Box flex height={{ max: '200px' }} overflow={'auto'}>
                    <Markdown>{event?.conditions ?? ''}</Markdown>
                  </Box>
                  <Anchor label="Zobraz" onClick={() => setShowEventTerms(true)} />
                </>
              ) : (
                <Text color="dark-5">
                  Turnaj nemá určené špeciálne podmienky pre účasť tímov. Platia podmienky programu.
                </Text>
              )}
            </Box>
          </LabelValue>
          <LabelValue
            label="Koniec registrácie"
            value={event?.registrationEnd ? formatDate(event?.registrationEnd) : 'neurčený'}
          />
          <LabelValue
            label="Maximálny počet tímov"
            value={(event?.maxTeams ?? 'neurčený').toString()}
          />
        </LabelValueGroup>

        {canEdit && (
          <Box direction="row" gap="small">
            <Button
              label="Zmeniť"
              onClick={() => setShowEventEditDialog(true)}
              disabled={!canEdit}
            />
            <Button
              label="Odstrániť"
              color="status-critical"
              onClick={handleDeleteEvent}
              disabled={!canEdit || !!event.deletedOn}
            />
          </Box>
        )}
      </Box>
      <EditEventDialog
        show={showEventEditDialog}
        event={event}
        onClose={() => setShowEventEditDialog(false)}
        onSubmit={(values) => updateEvent({ variables: { id: event.id, input: { ...values } } })}
      />
      <Modal
        show={showEventTerms}
        title="Podmienky turnaja"
        onClose={() => setShowEventTerms(false)}
        width="100vw"
        height="100vh"
        showButton
      >
        <Box flex pad="medium" height={{ max: '100%' }} overflow="auto">
          <Markdown>{event?.conditions ?? ''}</Markdown>
        </Box>
      </Modal>
    </Panel>
  );
}
