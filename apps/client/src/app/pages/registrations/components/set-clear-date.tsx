import React from 'react';

import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Text, Tip } from 'grommet';

interface SetClearDateProps {
  date?: string | null;
  onSet: () => void;
  onClear: () => void;
  canEdit?: boolean;
  tip?: string;
}

export function SetClearDate(props: SetClearDateProps) {
  const { date, onSet, onClear, canEdit, tip } = props;

  return (
    <Box direction="row" width="100%" justify="between">
      <Tip content={tip}>
        <Text>{date ? formatDate(date) : '-'}</Text>
      </Tip>

      {canEdit &&
        (date ? (
          <Anchor size="small" label="Zruš" onClick={() => onClear()} />
        ) : (
          <Tip content={tip}>
            <Anchor size="small" label="Potvrď" onClick={() => onSet()} />
          </Tip>
        ))}
    </Box>
  );
}
