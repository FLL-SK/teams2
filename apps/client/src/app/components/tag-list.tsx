import React from 'react';
import { Box, Button } from 'grommet';
import { Add } from 'grommet-icons';
import { useState } from 'react';
import { TagFragmentFragment } from '../generated/graphql';
import { SelectTag } from './select-tag';
import { TagPill } from './tag-pill';

interface TagListProps {
  tags?: TagFragmentFragment[];
  onRemove: (id: string) => void;
  onAdd?: (tag: TagFragmentFragment) => void;
  disabled?: boolean;
}

export function TagList(props: TagListProps) {
  const { tags, onRemove, disabled, onAdd } = props;
  const [isAdding, setIsAdding] = useState(false);

  if (!tags) {
    return null;
  }

  return (
    <Box fill="horizontal">
      {isAdding && (
        <Box>
          <SelectTag
            onSelect={(t) => {
              onAdd && onAdd(t);
              setIsAdding(false);
            }}
            onClose={() => setIsAdding(false)}
          />
        </Box>
      )}

      <Box direction="row" wrap style={{ minHeight: '25px' }} align="center">
        {tags
          .filter((t) => !t.deletedOn)
          .map((t) => (
            <TagPill key={t.id} tag={t} onRemove={onRemove} disabled={disabled} size="small" />
          ))}
        {onAdd && (
          <Button
            plain
            size="small"
            icon={<Add />}
            label="Pridať"
            onClick={() => setIsAdding(true)}
            style={{ marginLeft: '5px', marginTop: '5px' }}
            disabled={disabled}
          />
        )}
      </Box>
    </Box>
  );
}
