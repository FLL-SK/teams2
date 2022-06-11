import { Box } from 'grommet';

import { EventCard } from '../../components/event-card';
import { EventListFragmentFragment } from '../../generated/graphql';

interface ProgramEventsListProps {
  events: EventListFragmentFragment[];
}

export function ProgramEventsList(props: ProgramEventsListProps) {
  const { events } = props;

  return (
    <Box>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </Box>
  );
}
