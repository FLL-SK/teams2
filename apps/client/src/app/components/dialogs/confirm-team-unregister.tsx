import { Box, Button, Paragraph, Text } from 'grommet';
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
    <Modal width="medium" onClose={onClose} title="Potvrdenie">
      <Box pad="medium">
        <Paragraph>
          Naozaj chcete zrušiť registrciu tímu <strong>{teamName}</strong> na turnaji?
          <br />
          <br />
          Pokiaľ nie ste administrátor, tak registráciu môžete zrušiť len ak nebola ešte vystavená
          faktúra a neboli odoslané žiadne materiály k programu, napr. Challenge sety.
        </Paragraph>
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
