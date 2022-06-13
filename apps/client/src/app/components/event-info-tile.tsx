import { Box, Text, Tip } from 'grommet';
import { BorderType } from 'grommet/utils';
import styled from 'styled-components';
import { getColor } from '../theme';
import { EventFragmentFragment } from '../generated/graphql';
import { ListRow } from './list-row';

interface EventInfoTileProps {
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

export function EventInfoTile(props: EventInfoTileProps) {
  const { event, selected, onClick } = props;
  const border: BorderType = selected ? { color: getColor('brand'), size: 'large' } : {};
  return (
    <Container onClick={onClick} border={border} pad="medium">
      <Box direction="row" gap="medium" align="center">
        <Text size="large">{event.name}</Text>
        <Text>
          <Tip content="Počet tímov">{event.teams.length}</Tip>
        </Text>
      </Box>
    </Container>
  );
}
