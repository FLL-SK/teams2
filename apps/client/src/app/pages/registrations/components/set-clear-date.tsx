import React from 'react';

import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Text } from 'grommet';

interface SetClearDateProps {
  date?: string | null;
  onSet: () => void;
  onClear: () => void;
}

export function SetClearDate(props: SetClearDateProps) {
  const { date, onSet, onClear } = props;

  return (
    <Box direction="row" width="100%" justify="between">
      <Text>{date ? formatDate(date) : '-'}</Text>
      {date ? (
        <Anchor size="small" label="Zruš potvrdenie" onClick={() => onClear()} />
      ) : (
        <Anchor size="small" label="Potvrď" onClick={() => onSet()} />
      )}
    </Box>
  );
}
