import React from 'react';
import { Box } from 'grommet';
import styled from 'styled-components';
import { TagColorType } from '../generated/graphql';
import { getTagColor } from '../theme';
import { getColor } from '../theme/colors';
import { Close, Revert } from 'grommet-icons';
import { useState } from 'react';

import { TextStriked } from './text-striked';
import { EditTagDialog } from './dialogs/edit-tag-dialog';

interface TagPillProps {
  tag: { label: string; id: string; color: TagColorType; deletedOn?: string | null };
  size?: 'small' | 'medium' | 'large';
  margin?: 'xsmall' | 'small' | 'medium';
  onRemove?: (id: string) => unknown;
  onRestore?: (id: string) => unknown;
  onUpdate?: (id: string, label: string, color: TagColorType) => unknown;
  disabled?: boolean;
}

const ColoredTag = styled(Box)<{
  tagColor?: TagColorType | null;
  disabled?: boolean;
  editable?: boolean;
  deleted?: boolean;
}>`
  background-color: ${({ tagColor }) => tagColor && getTagColor(tagColor)?.background};
  border-style: ${({ deleted }) => (deleted ? 'dashed' : 'solid')};
  border-width: 1px;
  border-radius: 6px;
  border-color: ${getColor('icon')};
  cursor: ${({ disabled, editable }) => (editable && !disabled ? 'pointer' : 'auto')};
`;

export const TagPill = ({
  tag,
  onRemove,
  onRestore,
  onUpdate,
  disabled,
  size: tagSize,
  margin,
}: TagPillProps) => {
  const { color: tagColor, label, id, deletedOn } = tag;
  const [color, setColor] = useState<TagColorType>(tagColor ?? 'TC1');
  const [editing, setEditing] = useState<boolean>(false);

  const size = tagSize ?? 'medium';
  const iconSize = size === 'small' ? 'small' : 'medium';
  const textColor = tagColor ? getTagColor(tagColor)?.text : undefined;

  return (
    <ColoredTag
      direction="row"
      pad="xxsmall"
      gap="xsmall"
      align="center"
      tagColor={color}
      margin={margin ?? 'xxsmall'}
      editable={!!onUpdate}
      deleted={!!deletedOn}
    >
      <TextStriked
        striked={!!deletedOn}
        size={size}
        onClick={() => !deletedOn && !!onUpdate && setEditing(true)}
        color={textColor}
      >
        {label}
      </TextStriked>
      {onRemove && !deletedOn && (
        <Close
          size={iconSize}
          onClick={() => (disabled ? undefined : onRemove(id))}
          cursor="pointer"
          color={textColor}
        />
      )}
      {onRestore && !!deletedOn && (
        <Revert
          size={iconSize}
          onClick={() => (disabled ? undefined : onRestore(id))}
          cursor="pointer"
          color={textColor}
        />
      )}
      {editing && onUpdate && (
        <EditTagDialog
          label={label}
          color={color}
          onClose={() => setEditing(false)}
          onSubmit={async (newLabel, newColor) => {
            await onUpdate(id, newLabel, newColor);
            setColor(newColor);
            setEditing(false);
          }}
        />
      )}
    </ColoredTag>
  );
};
