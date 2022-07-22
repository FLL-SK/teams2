import React from 'react';
import { Box, BoxExtendedProps, Text } from 'grommet';

interface PanelProps extends BoxExtendedProps {
  title?: string;
}

export function Panel(props: PanelProps) {
  const { children, title, ...boxProps } = props;

  return (
    <Box background="light-1" gap="small">
      <Box pad="medium" background="#85C1E9">
        <Text weight="bold" size="medium">
          {title}{' '}
        </Text>
      </Box>
      <Box pad={{ vertical: 'small', horizontal: 'medium' }} {...boxProps}>
        {children}
      </Box>
    </Box>
  );
}

export const PanelGroup = ({ children, ...boxProps }: BoxExtendedProps) => (
  <Box gap="medium" {...boxProps}>
    {children}
  </Box>
);
