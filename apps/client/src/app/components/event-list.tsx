import React, { useMemo } from 'react';
import { Box } from 'grommet';
import { EventListTile } from './event-list-tile';
import { EventListFragmentFragment } from '../generated/graphql';
import { useNavigate } from 'react-router-dom';
import { appPath } from '@teams2/common';

interface EventListProps {
  events: EventListFragmentFragment[];
  onClick?: (event: EventListFragmentFragment) => void;
  onRemove?: (event: EventListFragmentFragment) => Promise<unknown>;
  showNotice?: boolean;
}

export function EventList(props: EventListProps) {
  const navigate = useNavigate();
  const { events, onClick, onRemove, showNotice } = props;

  const eventsM = useMemo(
    () => events.map((e) => e).sort((a, b) => (a.id > b.id ? 1 : -1)),
    [events]
  );

  return (
    <Box gap="small">
      {eventsM.map((event) => (
        <EventListTile
          key={event.id}
          event={event}
          onClick={onClick ? () => onClick(event) : () => navigate(appPath.event(event.id))}
          onRemove={onRemove ? () => onRemove(event) : undefined}
          showNotice={showNotice}
        />
      ))}
    </Box>
  );
}
