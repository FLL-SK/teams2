import { Box } from 'grommet';

import { EventCard } from './event-card';
import { EventListFragmentFragment } from '../generated/graphql';

interface EventsListProps {
  events: EventListFragmentFragment[];
}

export function EventsList(props: EventsListProps) {
  const { events } = props;

  return (
    <Box>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </Box>
  );
}
