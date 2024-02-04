import React from 'react';
import { Box, Button } from 'grommet';
import { Add } from 'grommet-icons';
import { useState } from 'react';
import { TagColorType, TagFragmentFragment } from '../_generated/graphql';
import { SelectTag } from './select-tag';
import { TagPill } from './tag-pill';

interface TagListProps {
  tags?: TagFragmentFragment[];
  onUpdate?: (id: string, label: string, color: TagColorType) => unknown;
  onRemove: (id: string) => void;
  onRestore?: (id: string) => void;
  onAdd?: (tag: TagFragmentFragment) => void;
  disabled?: boolean;
  noCreate?: boolean;
  tagSize?: 'small' | 'medium' | 'large';
}

export function TagList(props: TagListProps) {
  const {
    tags,
    onUpdate,
    onRemove,
    onRestore,
    disabled,
    onAdd,
    noCreate,
    tagSize = 'small',
  } = props;

  const [isAdding, setIsAdding] = useState(false);

  if (!tags) {
    return null;
  }

  return (
    <Box fill="horizontal">
      {isAdding && (
        <Box>
          <SelectTag
            selected={tags.map((t) => t.id)}
            onSelect={(t) => {
              onAdd && onAdd(t);
              setIsAdding(false);
            }}
            onClose={() => setIsAdding(false)}
            readonly={noCreate}
          />
        </Box>
      )}

      <Box direction="row" wrap style={{ minHeight: '25px' }} align="center">
        {tags.map((t) => (
          <TagPill
            key={t.id}
            tag={t}
            size={tagSize}
            onUpdate={onUpdate}
            onRemove={onRemove}
            disabled={disabled}
            onRestore={onRestore}
          />
        ))}
        {onAdd && (
          <Button
            plain
            size="small"
            icon={<Add />}
            onClick={() => setIsAdding(true)}
            disabled={disabled}
          />
        )}
      </Box>
    </Box>
  );
}
