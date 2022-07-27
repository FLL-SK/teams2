import { Box, Button, Text } from 'grommet';
import React from 'react';
import { Modal } from '../modal';

interface ConfirmTeamUnregisterDialogProps {
  teamName: string;
  onClose: () => void;
  onUnregister: () => Promise<unknown>;
}

export function ConfirmTeamUnregisterDialog(props: ConfirmTeamUnregisterDialogProps) {
  const { teamName, onClose, onUnregister } = props;

  return (
    <Modal width="medium" onClose={onClose}>
      <Box pad="medium">
        <Text>
          Chcete naozaj odhlásit tím <strong>{teamName}</strong> z turnaja?
        </Text>
        <Box pad="small" direction="row" justify="evenly">
          <Button
            plain
            label="Odhlásit"
            onClick={async () => {
              await onUnregister();
              onClose();
            }}
          />
          <Button label="Zrušit" onClick={onClose} />
        </Box>
      </Box>
    </Modal>
  );
}
