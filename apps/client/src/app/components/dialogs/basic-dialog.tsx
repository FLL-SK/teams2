import React, { ReactNode } from 'react';
import { Box, Button, ButtonType } from 'grommet';

import { Modal } from '../modal';

interface ActionButton {
  label: string;
  primary?: boolean;
  plain?: boolean;
  action: () => void;
}

interface BasicDialogProps {
  show?: boolean;
  title?: string;
  children?: ReactNode;
  onClose: () => void;
  buttons?: {
    yes?: ActionButton;
    no?: ActionButton;
    ok?: ActionButton;
  };
  buttonOk?: boolean;
}

export function BasicDialog(props: BasicDialogProps) {
  const { show, title, buttons, buttonOk, onClose, children } = props;

  if (!show) {
    return null;
  }

  return (
    <Modal title={title ?? ''} onClose={onClose} width="large" height="auto">
      <Box gap="medium">
        <>
          {children}
          {!buttons ? buttonOk ? <Button primary label="Ok" onClick={onClose} /> : null : buttons}
        </>
      </Box>
    </Modal>
  );
}
