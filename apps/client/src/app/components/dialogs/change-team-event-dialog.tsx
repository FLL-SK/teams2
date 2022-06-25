import React from 'react';
import { Box, Button, Select, Spinner } from 'grommet';
import { useState } from 'react';

import {
  EventListFragmentFragment,
  TeamListFragmentFragment,
  useGetProgramQuery,
} from '../../generated/graphql';
import { Modal } from '../modal';
import { LabelValue } from '../label-value';

interface ChangeTeamEventDialogProps {
  show?: boolean;
  team?: TeamListFragmentFragment;
  event?: EventListFragmentFragment;
  onClose: () => void;
  onSubmit?: (newEvent: EventListFragmentFragment) => unknown;
}

export function ChangeTeamEventDialog(props: ChangeTeamEventDialogProps) {
  const { show, team, event, onClose, onSubmit } = props;
  const [selectedEvent, setSelectedEvent] = useState<EventListFragmentFragment>();

  const { data, loading } = useGetProgramQuery({ variables: { id: event?.programId ?? '0' } });
  if (!show || !team || !event) {
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
                options={data?.getProgram.events ?? []}
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
