import React from 'react';
import { Box, Text } from 'grommet';
import { GapType } from 'grommet/utils';

interface PanelProps {
  title?: string;
  children: React.ReactNode;
  gap?: GapType;
}

export function Panel(props: PanelProps) {
  const { children, title, gap } = props;

  return (
    <Box background="light-1" gap="small">
      <Box pad="medium" background="#85C1E9">
        <Text weight="bold" size="medium">
          {title}{' '}
        </Text>
      </Box>
      <Box pad={{ vertical: 'small', horizontal: 'medium' }} gap={gap}>
        {children}
      </Box>
    </Box>
  );
}

export const PanelGroup = ({ children }: { children: React.ReactNode }) => (
  <Box gap="medium">{children}</Box>
);
