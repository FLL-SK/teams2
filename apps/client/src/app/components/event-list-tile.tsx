import { formatDate } from '@teams2/dateutils';
import { Box, Button, Text, Tip } from 'grommet';
import { Close } from 'grommet-icons';
import { BorderType } from 'grommet/utils';

import { EventListFragmentFragment } from '../generated/graphql';
import { getColor } from '../theme';
import { ListRow } from './list-row';

interface EventListTileProps {
  event: EventListFragmentFragment;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: (e: EventListFragmentFragment) => void;
  hideProgram?: boolean;
}

export function EventListTile(props: EventListTileProps) {
  const { event, selected, onClick, onRemove, hideProgram } = props;
  const border: BorderType = selected ? { color: getColor('brand'), size: 'large' } : {};

  return (
    <ListRow
      columns="1fr 150px 50px auto"
      onClick={onClick}
      pad="small"
      align="center"
      border={border}
    >
      <Box>
        <Text>{event.name}</Text>
        {!hideProgram && <Text size="small">{event.program.name}</Text>}
      </Box>

      <Text>{formatDate(event.date)}</Text>
      <Text>
        <Tip content="Počet tímov">{event.teamsIds.length}</Tip>
      </Text>
      {onRemove && (
        <Button
          plain
          hoverIndicator
          icon={<Close size="small" />}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(event);
          }}
        />
      )}
    </ListRow>
  );
}
