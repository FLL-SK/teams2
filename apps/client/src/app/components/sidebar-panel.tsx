import React from 'react';
import { Box, Button, Collapsible } from 'grommet';
import { Down, Next } from 'grommet-icons';
import { GapType } from 'grommet/utils';
import { ReactNode, useState } from 'react';
import styled from 'styled-components';

interface SidebarPanelProps {
  label?: string;
  header?: ReactNode;
  children?: string | number | ReactNode;
  gap?: GapType;
  collapsible?: boolean | { open: boolean };
  hidden?: boolean;
}

const Label = styled.span`
  font-weight: bold;
`;

export const SidebarPanelGroup = styled(Box)`
  height: min-content;
`;

export function SidebarPanel(props: SidebarPanelProps) {
  const { label, header, children, gap, collapsible = false, hidden } = props;
  const [collapse, setCollapse] = useState<boolean>(
    typeof collapsible === 'boolean' ? collapsible : !collapsible.open
  );
  if (hidden) {
    return null;
  }
  return (
    <Box height={{ min: 'auto' }}>
      <Box direction="row" align="center">
        {collapsible && (
          <Button
            hoverIndicator
            icon={collapse ? <Next size="small" /> : <Down size="small" />}
            onClick={() => setCollapse(!collapse)}
          />
        )}
        {label && (
          <Box style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            <Label>{label}</Label>
          </Box>
        )}
        <Box direction="row" justify="end" fill="horizontal" gap="small">
          {header}
        </Box>
      </Box>
      <Collapsible open={!collapse}>
        <Box background={'white'} pad="xsmall" gap={gap}>
          {children}
        </Box>
      </Collapsible>
    </Box>
  );
}
