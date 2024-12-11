import React, { ReactNode } from 'react';
import { Box, Button, ButtonType, Text } from 'grommet';

import { Modal } from '../modal';

interface ActionButton {
  label: string;
  primary?: boolean;
  plain?: boolean;
  action: () => void;
}

interface YesNoDialogProps {
  title?: string;
  message: string;
  onYes: () => void | Promise<void>;
  onNo?: () => void | Promise<void>;
  onClose: () => void;
}

export function YesNoDialog(props: YesNoDialogProps) {
  const { title, message, onYes, onNo, onClose } = props;

  return (
    <Modal title={title ?? ''} onClose={onClose} width="medium" height="auto">
      <Box gap="medium">
        <Text>{message}</Text>

        <Box direction="row" gap="small" justify="between">
          <Button
            primary
            label="Nie"
            onClick={async () => {
              if (onNo) await onNo();
              onClose();
            }}
          />
          <Button
            label="Áno"
            onClick={async () => {
              await onYes();
              onClose();
            }}
          />
        </Box>
      </Box>
    </Modal>
  );
}
