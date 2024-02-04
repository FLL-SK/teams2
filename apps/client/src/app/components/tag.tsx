import React from 'react';
import { Box, Text, Button } from 'grommet';
import { Close } from 'grommet-icons';
import styled from 'styled-components';
import { getTagColor } from '../theme';
import { TagColorType } from '../_generated/graphql';

interface TagProps {
  value: string;
  onClick?: () => void;
  onRemove?: () => void;
  color?: TagColorType;
  size?: 'small' | 'medium' | 'large';
}

const ColoredClose = styled(Close)<{ color?: string }>`
  :hover {
    stroke: ${(p) => p.color};
  }
`;

export function Tag(props: TagProps) {
  const { value, onClick, onRemove, color, size } = props;
  return (
    <Box
      margin="xsmall"
      round="xsmall"
      direction="row"
      gap="small"
      border="all"
      align="center"
      pad="xxsmall"
      background={getTagColor(color)?.background}
    >
      {onClick ? (
        <Button plain onClick={onClick} size={size} label={value} />
      ) : (
        <Text size={size} color={getTagColor(color)?.text}>
          {value}
        </Text>
      )}
      {onRemove && (
        <Button
          plain
          icon={<ColoredClose size="small" color={getTagColor(color)?.text} />}
          onClick={onRemove}
        />
      )}
    </Box>
  );
}
