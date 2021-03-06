import React from 'react';
import { formatDate } from '@teams2/dateutils';
import { Box, Button, Text, Tip } from 'grommet';
import { Calendar, Close, Group } from 'grommet-icons';
import { BorderType } from 'grommet/utils';

import { EventListFragmentFragment } from '../generated/graphql';
import { getColor } from '../theme';
import { ListRow2 } from './list-row';

interface EventListTileProps {
  event: EventListFragmentFragment;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: (e: EventListFragmentFragment) => void;
  hideProgram?: boolean;
}

export function EventListTile(props: EventListTileProps) {
  const { event, selected, onClick, onRemove, hideProgram } = props;
  const border: BorderType = selected
    ? { color: getColor('brand'), size: 'large' }
    : { side: 'top' };

  return (
    <ListRow2
      columns="1fr 180px 75px auto"
      onClick={onClick}
      pad="small"
      align="center"
      border={border}
    >
      <Box>
        <Text>{event.name}</Text>
        {!hideProgram && <Text size="small">{event.program.name}</Text>}
      </Box>

      <Box direction="row" gap="xsmall" align="center">
        <Calendar />
        <Text>{event.date ? formatDate(event.date) : 'neurčený'}</Text>
      </Box>

      <Tip content="Počet tímov">
        <Box direction="row" gap="xsmall" align="center">
          <Group />
          <Text>{event.registrationsCount}</Text>
        </Box>
      </Tip>

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
    </ListRow2>
  );
}
