import React from 'react';
import { Box } from 'grommet';
import styled from 'styled-components';
import { TagColorType } from '../generated/graphql';
import { getColor, getTagColor, getTagColorCodes } from '../theme';

const ColorBox = styled(Box)<{ color: TagColorType; selected: boolean }>`
  width: ${({ selected }) => (selected ? '40px' : '32px')};
  height: ${({ selected }) => (selected ? '40px' : '32px')};
  background-color: ${({ color }) => getTagColor(color)?.background};
  border-style: solid;
  border-width: ${({ selected }) => (selected ? '4px' : '1px')};
  border-color: ${({ selected }) => (selected ? getColor('brand') : getColor('border'))};
`;

interface TagColorPickerProps {
  selected: TagColorType;
  onClose?: () => unknown;
  onChange?: (color: TagColorType) => unknown;
}

export function TagColorPicker(props: TagColorPickerProps) {
  const { selected, onClose, onChange } = props;

  return (
    <Box direction="row" gap="xsmall" onBlur={() => onClose && onClose()} align="center">
      {getTagColorCodes().map((c) => (
        <ColorBox
          key={c}
          color={c}
          selected={c === selected}
          onClick={() => onChange && onChange(c)}
        />
      ))}
    </Box>
  );
}
