import React from 'react';
import { formatDate } from '@teams2/dateutils';
import { Box, Button, Text, Tip } from 'grommet';
import { Calendar, Close, Group } from 'grommet-icons';
import { BorderType, ColorType } from 'grommet/utils';

import { EventListFragmentFragment } from '../_generated/graphql';
import { getColor } from '../theme';
import { ListRow2 } from './list-row';

interface EventListTileProps {
  event: EventListFragmentFragment;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: (e: EventListFragmentFragment) => void;
  hideProgram?: boolean;
  disabled?: boolean;
  showNotice?: { notice: string; color?: ColorType };
}

export function EventListTile(props: EventListTileProps) {
  const { event, selected, onClick, onRemove, hideProgram, disabled, showNotice } = props;
  const border: BorderType = selected
    ? { color: getColor('brand'), size: 'large' }
    : { side: 'top' };

  return (
    <ListRow2
      columns="1fr 180px 150px auto"
      onClick={disabled ? undefined : onClick}
      pad="small"
      align="center"
      border={border}
    >
      <Box direction="row" align="center" gap="small">
        <Box height="30px" width="20px" background={event.program.color ?? undefined}></Box>
        <Box>
          <Text>{event.name}</Text>
          {!hideProgram && <Text size="small">{event.program.name}</Text>}
          {disabled && (
            <Text color="status-warning" size="small">
              Na tento turnaj sa nedá registrovať.
            </Text>
          )}
        </Box>
      </Box>

      <Box direction="row" gap="xsmall" align="center">
        <Calendar />
        <Text>{event.date ? formatDate(event.date) : 'neurčený'}</Text>
      </Box>

      <Box gap="small">
        <Box direction="row" gap="small">
          <Tip content="Počet tímov / maximálny">
            <Box direction="row" gap="xsmall" align="center">
              <Group />
              <Text>
                {event.registrationsCount}/{event.maxTeams ?? '-'}
              </Text>
            </Box>
          </Tip>
        </Box>
        {showNotice && (
          <Text color={showNotice.color} size="small">
            {showNotice.notice}
          </Text>
        )}
      </Box>

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
