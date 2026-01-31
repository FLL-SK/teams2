import React from 'react';
import { Box } from 'grommet';
import { EventListTile } from './event-list-tile';
import { EventListFragmentFragment } from '../_generated/graphql';
import { useNavigate } from 'react-router-dom';
import { appPath } from '@teams2/common';

interface EventListProps {
  events?: EventListFragmentFragment[];
  onClick?: (event: EventListFragmentFragment) => void;
  onRemove?: (event: EventListFragmentFragment) => Promise<unknown>;
}

export function EventList(props: EventListProps) {
  const navigate = useNavigate();
  const { events, onClick, onRemove } = props;

  return (
    <Box gap="small">
      {!events || events.length === 0 ? (
        <Box pad="medium">Žiadne turnaje na zobrazenie.</Box>
      ) : null}
      {events &&
        events.map((event) => (
          <EventListTile
            key={event.id}
            event={event}
            onClick={onClick ? () => onClick(event) : () => navigate(appPath.event(event.id))}
            onRemove={onRemove ? () => onRemove(event) : undefined}
          />
        ))}
    </Box>
  );
}
