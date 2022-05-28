import { Box, Text } from 'grommet';
import { EventFragmentFragment } from '../generated/graphql';
import { useAuthenticate } from './useAuthenticate';

interface EventTileProps {
  event: EventFragmentFragment;
}

export function EventTile(props: EventTileProps) {
  const { event } = props;
  return (
    <Box>
      <Box direction="row" gap="medium" align="center">
        <Text size="large">{event.name}</Text>
        {event.teams.length}
      </Box>
      <Box>
        {event.teams.map((team) => (
          <Box key={team.id}>{team.name}</Box>
        ))}
      </Box>
    </Box>
  );
}
