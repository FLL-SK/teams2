import React from 'react';

import { formatDate } from '@teams2/dateutils';
import { Anchor, Box, Button, Text, Tip } from 'grommet';
import { FormClose } from 'grommet-icons';

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
}

export function SetClearDate(props: SetClearDateProps) {
  const { date, onSet, onClear, canEdit, clearType, action } = props;

  return (
    <Box direction="row" width="100%" justify="between" align="center">
      <Text>{date ? formatDate(date) : '-'}</Text>

      {canEdit && date && <Button size="small" label="Zruš" onClick={() => onClear()} />}
      {canEdit && !date && <Button size="small" label="Potvrď" onClick={() => onSet()} />}
      {action && !action.hide && (
        <Button size="small" label={action.label} onClick={action.onClick} />
      )}
    </Box>
  );
}
