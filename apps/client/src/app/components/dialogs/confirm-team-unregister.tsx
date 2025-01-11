import { Box, Button, Paragraph, Text } from 'grommet';
import React from 'react';
import { Modal } from '../modal';

interface ConfirmTeamUnregisterDialogProps {
  type: 'EVENT' | 'PROGRAM';
  teamName: string;
  onClose: () => void;
  onUnregister: () => Promise<unknown>;
}

export function ConfirmTeamUnregisterDialog(props: ConfirmTeamUnregisterDialogProps) {
  const { teamName, onClose, onUnregister, type } = props;

  return (
    <Modal width="medium" onClose={onClose} title="Potvrdenie">
      <Box pad="medium">
        <Paragraph>
          Naozaj chcete zrušiť registráciu tímu <strong>{teamName}</strong>{' '}
          {type === 'EVENT' ? 'na turnaji' : 'v programe'}?
          <br />
          <br />
          Ako tréner môžete zrušiť registráciu len ak ešte nebola potrdená. V opačnom prípade je
          potrebné kontaktovať organizátora turnaja, alebo programu.
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
