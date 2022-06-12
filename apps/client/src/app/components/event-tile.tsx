import { Box, Text } from 'grommet';
import { BorderType } from 'grommet/utils';
import styled from 'styled-components';
import { getColor } from '../theme';
import { EventFragmentFragment } from '../generated/graphql';

interface EventTileProps {
  event: EventFragmentFragment;
  selected?: boolean;
  onClick?: () => void;
}

const Container = styled(Box)`
  cursor: 'pointer';
  :hover {
    background-color: ${getColor('light-4')};
  }
`;

export function EventTile(props: EventTileProps) {
  const { event, selected, onClick } = props;
  const border: BorderType = selected ? { color: getColor('brand') } : {};
  return (
    <Container onClick={onClick} border={border}>
      <Box direction="row" gap="medium" align="center">
        <Text size="large">{event.name}</Text>
        {event.teams.length}
      </Box>
      <Box>
        {event.teams.map((team) => (
          <Box key={team.id}>{team.name}</Box>
        ))}
      </Box>
    </Container>
  );
}
