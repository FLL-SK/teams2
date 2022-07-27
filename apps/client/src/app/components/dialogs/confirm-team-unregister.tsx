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
          Naozaj chcete zrušiť registrciu tímu <strong>{teamName}</strong> na turnaji?
        </Text>
        <Box pad="small" direction="row" justify="evenly">
          <Button
            plain
            label="Zrušiť registráciu"
            onClick={async () => {
              await onUnregister();
              onClose();
            }}
          />
          <Button label="Ponechať" onClick={onClose} />
        </Box>
      </Box>
    </Modal>
  );
}
