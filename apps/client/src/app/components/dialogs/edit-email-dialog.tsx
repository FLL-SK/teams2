import React, { useEffect, useState } from 'react';
import { Box, Button, Form, FormField } from 'grommet';
import { Modal } from '../modal';

interface EditEmailDialogProps {
  title?: string;
  email?: string | null;
  onClose: () => void;
  onSubmit: (data: EditEmailDialogFields) => Promise<unknown>;
  show?: boolean;
}

export interface EditEmailDialogFields {
  email?: string | null;
}

export function EditEmailDialog(props: EditEmailDialogProps) {
  const { onClose, onSubmit, show = true, email, title } = props;
  const [formValues, setFormValues] = useState<EditEmailDialogFields>();

  useEffect(() => {
    setFormValues({
      email: email ?? '',
    });
  }, [email]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: EditEmailDialogFields }) => {
    await onSubmit(value);
    onClose();
  };

  return (
    <Modal title={title ?? 'Aktualizovať email'} onClose={onClose} width="medium">
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="E-mail" name="email" required />
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={'Uložiť'} />
        </Box>
      </Form>
    </Modal>
  );
}
