import { Box, Button } from 'grommet';
import React, { useCallback, useMemo, useState } from 'react';
import { EditEventDialog } from '../../../components/dialogs/edit-event-dialog';
import { EventList } from '../../../components/event-list';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import {
  EventListFragmentFragment,
  ProgramFragmentFragment,
  CreateEventDocument,
  CreateEventMutation,
  CreateEventMutationVariables,
  DeleteEventDocument,
  DeleteEventMutation,
  DeleteEventMutationVariables,
} from '../../../_generated/graphql';
import { useMutation } from '@apollo/client/react';

interface PanelProgramEventsProps {
  program: ProgramFragmentFragment;
  canEdit: boolean;
  onUpdate: () => void;
}

export function PanelProgramEvents(props: PanelProgramEventsProps) {
  const { program, canEdit, onUpdate } = props;
  const { notify } = useNotification();

  const [showAddEventDialog, setShowAddEventDialog] = useState(false);

  const [createEvent] = useMutation<CreateEventMutation, CreateEventMutationVariables>(CreateEventDocument, {
    onCompleted: onUpdate,
    onError: (e) => notify.error('Nepodarilo sa vytvoriť turnaj.', e.message),
  });
  const [deleteEvent] = useMutation<DeleteEventMutation, DeleteEventMutationVariables>(DeleteEventDocument, {
    onCompleted: onUpdate,
    onError: (e) => notify.error('Nepodarilo sa zrušiť turnaj.', e.message),
  });

  const events = useMemo(
    () => (program.events ?? []).filter((event) => !event.deletedOn),
    [program],
  );

  const handleDeleteEvent = useCallback(
    async (e: EventListFragmentFragment) => {
      if (e.registrationsCount === 0) {
        deleteEvent({ variables: { id: e.id } });
      } else {
        alert('Nie je možné vymazať turnaj, na ktorý je prihlásený jeden alebo viac tímov.');
      }
    },
    [deleteEvent],
  );

  return (
    <Panel title="Turnaje" gap="medium">
      <Box direction="row" justify="between">
        {canEdit && (
          <Box>
            <Button
              label="Pridať turnaj"
              onClick={() => setShowAddEventDialog(true)}
              disabled={!canEdit}
            />
          </Box>
        )}
      </Box>

      <EventList events={events} onRemove={canEdit ? handleDeleteEvent : undefined} />

      <EditEventDialog
        show={showAddEventDialog}
        onClose={() => setShowAddEventDialog(false)}
        onSubmit={(values) =>
          createEvent({ variables: { input: { ...values, programId: program.id } } })
        }
      />
    </Panel>
  );
}
