import React from 'react';
import { Box, Button, Layer } from 'grommet';
import { Close } from 'grommet-icons';
import { WidthType } from 'grommet/utils';
import { ReactNode } from 'react';

interface SidebarProps {
  onClose?: () => unknown;
  children?: ReactNode | null;
  width?: WidthType;
}

interface ClosableSidebarProps extends SidebarProps {
  show: boolean;
}

export function Sidebar(props: SidebarProps) {
  const { onClose, children, width = '300px' } = props;

  return (
    <Box height="100vh" width={width} background="brandLighter" pad="small">
      {onClose && <Button icon={<Close size="small" />} onClick={() => onClose && onClose()} />}
      <Box height="100%" width="100%">
        {children}
      </Box>
    </Box>
  );
}

export function ClosableSidebar(props: ClosableSidebarProps) {
  const { show, onClose, children, width = '300px' } = props;

  if (!show) {
    return null;
  }
  return (
    <Layer
      onEsc={() => onClose && onClose()}
      onClickOutside={() => onClose && onClose()}
      modal={false}
      position="right"
    >
      <Sidebar onClose={onClose} width={width}>
        {children}
      </Sidebar>
    </Layer>
  );
}
