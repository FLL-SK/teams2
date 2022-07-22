import React, { useEffect, useState } from 'react';
import { Box, Button, Form, FormField } from 'grommet';
import { Modal } from '../modal';

interface EditShipmentGroupDialogProps {
  group?: string | null;
  onClose: () => void;
  onSubmit: (group: string) => Promise<unknown>;
  show?: boolean;
}

interface FormFields {
  group: string;
}

export function EditShipmentGroupDialog(props: EditShipmentGroupDialogProps) {
  const { onClose, onSubmit, show = true, group } = props;
  const [formValues, setFormValues] = useState<FormFields>();

  useEffect(() => {
    setFormValues({
      group: group ?? '',
    });
  }, [group]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    await onSubmit(value.group);
    onClose();
  };

  return (
    <Modal title={'Označenie zásielky'} onClose={onClose} width="small">
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="Označenie" name="group" required autoFocus />
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label="Uložiť" />
        </Box>
      </Form>
    </Modal>
  );
}
