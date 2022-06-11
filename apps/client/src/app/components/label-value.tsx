import { Box, Text } from 'grommet';
import { ReactNode } from 'react';

interface LabelValueProps {
  label: string;
  labelWidth?: string;
  value?: string | null;
  direction?: 'row' | 'column';
  children?: ReactNode;
}

export const LabelValue = (props: LabelValueProps) => {
  const { label, value = '', direction = 'row', labelWidth, children } = props;
  return (
    <Box direction={direction} gap={direction !== 'row' ? 'medium' : undefined}>
      <Box width={labelWidth}>
        <Text weight="bold">{label}</Text>
      </Box>
      {typeof value === 'string' && <Text>{value}</Text>}
      {children}
    </Box>
  );
};
