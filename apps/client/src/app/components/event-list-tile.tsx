import React from 'react';
import { formatDate } from '@teams2/dateutils';
import { Box, Button, Text, Tip } from 'grommet';
import { Calendar, Close, Group } from 'grommet-icons';
import { BorderType } from 'grommet/utils';

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
  showNotice?: boolean;
}

export function EventListTile(props: EventListTileProps) {
  const { event, selected, onClick, onRemove, hideProgram, disabled, showNotice } = props;
  const border: BorderType = selected
    ? { color: getColor('brand'), size: 'large' }
    : { side: 'top' };
  let maxColor = undefined;
  let notice = undefined;
  if (event.maxTeams && event.registrationsCount >= event.maxTeams) {
    maxColor = 'status-critical';
    notice = 'Turnaj je naplnený';
  } else if (event.maxTeams && event.maxTeams - event.registrationsCount < 3) {
    maxColor = 'status-warning';
    notice = 'Posledné miesta';
  } else if (event.invitationOnly) {
    maxColor = 'status-warning';
    notice = 'Len na pozvánky';
  }

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
              <Group color={maxColor} />
              <Text color={maxColor}>
                {event.registrationsCount}/{event.maxTeams ?? '-'}
              </Text>
            </Box>
          </Tip>
        </Box>
        {showNotice && (
          <Text color={maxColor} size="small">
            {notice}
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
