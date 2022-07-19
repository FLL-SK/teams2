import React from 'react';
import { Box, Text, Button } from 'grommet';
import { Close } from 'grommet-icons';
import styled from 'styled-components';

interface TagProps {
  value: string;
  onClick?: () => void;
  onRemove?: () => void;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

const RedClose = styled(Close)`
  :hover {
    stroke: red;
  }
`;

export function Tag(props: TagProps) {
  const { value, onClick, onRemove, color, size } = props;
  return (
    <Box
      margin="xsmall"
      round="small"
      direction="row"
      gap="small"
      border="all"
      align="center"
      pad="xsmall"
      color={color}
    >
      {onClick ? (
        <Button plain onClick={onClick} size={size} label={value} />
      ) : (
        <Text size={size}>{value}</Text>
      )}
      {onRemove && <Button plain icon={<RedClose size="small" />} onClick={onRemove} />}
    </Box>
  );
}
