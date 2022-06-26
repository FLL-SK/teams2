import React from 'react';
import { Box, Button, Text } from 'grommet';
import { FileFragmentFragment } from '../generated/graphql';
import { ListRow } from './list-row';
import { Close } from 'grommet-icons';
import hr from '@tsmx/human-readable';

interface FileTileProps {
  file: FileFragmentFragment;
  onDelete?: (f: FileFragmentFragment) => unknown;
  readOnly?: boolean;
}

export function FileTile(props: FileTileProps) {
  const { file, onDelete, readOnly } = props;

  return (
    <Box flex>
      <ListRow
        columns="1fr 100px auto"
        align="center"
        pad={{ left: 'small', right: 'small' }}
        onClick={() => window.open(file.url, '_self')}
      >
        <Text>{file.name}</Text>
        <Text>{hr.fromBytes(file.size, { fixedPrecision: 1 })}</Text>
        <Button
          disabled={readOnly}
          icon={<Close size="small" />}
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(file);
          }}
        />
      </ListRow>
    </Box>
  );
}
