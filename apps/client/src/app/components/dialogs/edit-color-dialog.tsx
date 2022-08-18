import React, { useState } from 'react';
import { Box, Button } from 'grommet';
import { Modal } from '../modal';

import { SketchPicker } from 'react-color';

interface EditColorDialogProps {
  title?: string;
  color?: string;
  onClose: () => void;
  onSubmit: (color: string) => unknown;
  show?: boolean;
}

export function EditColorDialog(props: EditColorDialogProps) {
  const { onClose, onSubmit, show = true, color, title } = props;
  const [formColor, setFormColor] = useState<string>(color ?? '#ffffff');

  if (!show) {
    return null;
  }

  const handleSubmit = async () => {
    await onSubmit(formColor);
    onClose();
  };

  return (
    <Modal title={title ?? 'Vybrať farbu'} onClose={onClose} width="medium">
      <form onSubmit={handleSubmit} target="_self">
        <SketchPicker color={formColor} onChangeComplete={({ hex }) => setFormColor(hex)} />

        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary label={'Uložiť'} onClick={handleSubmit} />
        </Box>
      </form>
    </Modal>
  );
}
