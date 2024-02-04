import React from 'react';
import { Box, Button, Text } from 'grommet';
import { FileFragmentFragment } from '../_generated/graphql';
import { ListRow2 } from './list-row';
import { Close } from 'grommet-icons';

interface FileTileProps {
  file: FileFragmentFragment;
  onDelete?: (f: FileFragmentFragment) => unknown;
  readOnly?: boolean;
}

const toLocNum = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 });

function formatSize(bytes: number): string {
  if (bytes > 1000000) {
    return `${toLocNum(bytes / 1000000)} MiB`;
  } else if (bytes > 1000) {
    return `${toLocNum(bytes / 1000)} KiB`;
  } else return `${toLocNum(bytes)} B`;
}

export function FileTile(props: FileTileProps) {
  const { file, onDelete, readOnly } = props;

  return (
    <Box flex width="580px">
      <ListRow2
        columns="1fr 100px auto"
        align="center"
        pad={{ left: 'small', right: 'small' }}
        onClick={() => window.open(file.url, '_self')}
      >
        <Text>{file.name}</Text>
        <Text>{formatSize(file.size)}</Text>
        <Button
          disabled={readOnly}
          icon={<Close size="small" />}
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(file);
          }}
        />
      </ListRow2>
    </Box>
  );
}
