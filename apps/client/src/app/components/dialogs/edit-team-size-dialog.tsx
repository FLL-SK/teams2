import React, { useEffect, useState } from 'react';
import { Box, Button, Form, FormField } from 'grommet';
import { Modal } from '../modal';

interface EditTeamSizeDialogProps {
  size?: number | null;
  onClose: () => void;
  onSubmit: (teamSize: number) => Promise<unknown>;
  show?: boolean;
}

interface FormFields {
  size: number;
}

export function EditTeamSizeDialog(props: EditTeamSizeDialogProps) {
  const { onClose, onSubmit, show = true, size } = props;
  const [formValues, setFormValues] = useState<FormFields>();

  useEffect(() => {
    setFormValues({
      size: size ?? 0,
    });
  }, [size]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    await onSubmit(value.size);
    onClose();
  };

  return (
    <Modal title={'Počet členov tímu'} onClose={onClose} width="small">
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="Počet" name="size" type="number" required autoFocus />
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label="Uložiť" />
        </Box>
      </Form>
    </Modal>
  );
}
