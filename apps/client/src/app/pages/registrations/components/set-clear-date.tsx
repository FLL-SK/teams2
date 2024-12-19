import React from 'react';

import { formatDate } from '@teams2/dateutils';
import { Box, Button, Text } from 'grommet';

interface Action {
  label: string;
  hide?: boolean;
  onClick: () => void;
}

interface SetClearDateProps {
  date?: string | null;
  onSet: () => void;
  onClear: () => void;
  canEdit?: boolean;
  action?: Action;
  clearType?: 'button' | 'anchor';
  direction?: 'row' | 'column';
}

export function SetClearDate(props: SetClearDateProps) {
  const { date, onSet, onClear, canEdit, clearType, action, direction = 'row' } = props;

  return (
    <Box
      direction={direction}
      width="100%"
      align={direction === 'row' ? 'center' : undefined}
      gap="small"
    >
      <Text>{date ? formatDate(date) : '-'}</Text>

      <Box direction="row" gap="small">
        {canEdit && date && <Button size="small" label="Zruš" onClick={() => onClear()} />}
        {canEdit && !date && <Button size="small" label="Potvrď" onClick={() => onSet()} />}
      </Box>
      <Box direction="row" gap="small">
        {action && !action.hide && (
          <Button size="small" label={action.label} onClick={action.onClick} />
        )}
      </Box>
    </Box>
  );
}
