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
  tip?: string;
  action?: Action;
  clearType?: 'button' | 'anchor';
}

export function SetClearDate(props: SetClearDateProps) {
  const { date, onSet, onClear, canEdit, tip, clearType, action } = props;

  return (
    <Box direction="row" width="100%" justify="between">
      <Box direction="row">
        {date && canEdit && clearType !== 'anchor' && (
          <Button plain tip="Zruš" icon={<FormClose color="brand" />} onClick={() => onClear()} />
        )}
        <Tip content={tip}>
          <Text>{date ? formatDate(date) : '-'}</Text>
        </Tip>
      </Box>

      {canEdit && date && clearType === 'anchor' && (
        <Anchor size="small" label="Zruš" onClick={() => onClear()} />
      )}
      {canEdit && !date && <Anchor size="small" label="Potvrď" onClick={() => onSet()} />}
      {action && !action.hide && (
        <Anchor size="small" label={action.label} onClick={action.onClick} />
      )}
    </Box>
  );
}
