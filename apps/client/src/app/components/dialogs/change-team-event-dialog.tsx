import React from 'react';
import { Box, Button, Select, Spinner } from 'grommet';
import { useState } from 'react';

import {
  EventBasicFragmentFragment,
  EventListFragmentFragment,
  TeamBasicFragmentFragment,
  useGetEventsQuery,
} from '../../generated/graphql';
import { Modal } from '../modal';
import { LabelValue } from '../label-value';

interface ChangeTeamEventDialogProps {
  show?: boolean;
  team?: TeamBasicFragmentFragment;
  event: EventBasicFragmentFragment;
  onClose: () => void;
  onSubmit?: (newEvent: EventBasicFragmentFragment) => unknown;
}

export function ChangeTeamEventDialog(props: ChangeTeamEventDialogProps) {
  const { show, team, event, onClose, onSubmit } = props;
  const [selectedEvent, setSelectedEvent] = useState<EventBasicFragmentFragment>();

  const { data, loading } = useGetEventsQuery({
    variables: { filter: { programId: event.programId, isActive: true } },
  });

  if (!show || !team) {
    return null;
  }

  return (
    <Modal title={'Zmena turnaja'} onClose={onClose} width="large" height="auto">
      <Box gap="medium" pad="medium">
        <LabelValue label="Tím" labelWidth="200px" value={team.name} />
        <LabelValue label="Registrovaný na" labelWidth="200px" value={event.name} />
        <LabelValue label="Zmeniť na" labelWidth="200px">
          {loading ? (
            <Spinner />
          ) : (
            <Box flex>
              <Select
                options={data?.getEvents ?? []}
                disabled={[event.id]}
                valueKey={(o: EventListFragmentFragment) => o.id}
                labelKey={(o: EventListFragmentFragment) => o.name}
                onChange={({ option }) => setSelectedEvent(option)}
              />
            </Box>
          )}
        </LabelValue>
        <Box direction="row" justify="evenly">
          <Button
            label="Zmeniť turnaj"
            onClick={() => {
              if (selectedEvent && onSubmit) {
                onSubmit(selectedEvent);
                onClose();
              }
            }}
            disabled={!selectedEvent || selectedEvent.id === event.id}
          />
          <Button label="Zrušiť" primary onClick={() => onClose()} />
        </Box>
      </Box>
    </Modal>
  );
}
