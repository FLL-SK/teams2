import React from 'react';
import { Box, Drop, Text } from 'grommet';
import styled from 'styled-components';
import { TagColorType, useUpdateTagMutation } from '../generated/graphql';
import { getTagColor } from '../theme';
import { getColor } from '../theme/colors';
import { Close } from 'grommet-icons';
import { useRef, useState } from 'react';
import { TagColorPicker } from './tag-color-picker';

interface TagPillProps {
  tag: { label: string; id: string; color: TagColorType };
  size?: 'small' | 'medium' | 'large';
  margin?: 'xsmall' | 'small' | 'medium';
  onRemove?: (id: string) => unknown;
  disabled?: boolean;
  editable?: boolean;
}

const ColoredTag = styled(Box)<{
  tagColor?: TagColorType | null;
  disabled?: boolean;
  editable?: boolean;
}>`
  background-color: ${({ tagColor }) => tagColor && getTagColor(tagColor)};
  border-style: solid;
  border-width: 1px;
  border-radius: 20px;
  border-color: ${getColor('icon')};
  cursor: ${({ disabled, editable }) => (editable && !disabled ? 'pointer' : 'auto')};
`;

export const TagPill = ({
  tag,
  onRemove,
  disabled,
  size: tagSize,
  editable,
  margin,
}: TagPillProps) => {
  const [updateTag] = useUpdateTagMutation();
  const { color: tagColor, label, id } = tag;
  const [color, setColor] = useState<TagColorType>(tagColor ?? 'TC1');
  const [editing, setEditing] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  const size = tagSize ?? 'medium';
  const closeSize = size === 'small' ? 'small' : 'medium';

  return (
    <ColoredTag
      ref={ref}
      direction="row"
      pad="xsmall"
      gap="xsmall"
      align="center"
      tagColor={color}
      margin={margin ?? 'xxsmall'}
      editable={editable}
    >
      <Text size={size} onClick={() => editable && setEditing(true)}>
        {label}
      </Text>
      {onRemove && (
        <Close
          size={closeSize}
          onClick={() => (disabled ? undefined : onRemove && onRemove(id))}
          cursor="pointer"
        />
      )}
      {editing && (
        <Drop target={ref.current ?? undefined} align={{ bottom: 'top' }}>
          <TagColorPicker
            selected={color}
            onChange={(c) => {
              updateTag({ variables: { id, input: { label, color: c } } });
              setColor(c);
              setEditing(false);
            }}
            onClose={() => setEditing(false)}
          />
        </Drop>
      )}
    </ColoredTag>
  );
};
