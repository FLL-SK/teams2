import React, { useEffect, useState } from 'react';
import { Box, Button, Form, FormField } from 'grommet';
import { Modal } from '../modal';

interface EditContactDialogProps {
  contact?: EditContactDialogFields;
  onClose: () => void;
  onSubmit: (data: EditContactDialogFields) => Promise<unknown>;
  show?: boolean;
}

export interface EditContactDialogFields {
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
}

export function EditContactDialog(props: EditContactDialogProps) {
  const { onClose, onSubmit, show = true, contact } = props;
  const [formValues, setFormValues] = useState<EditContactDialogFields>();

  useEffect(() => {
    setFormValues({
      contactName: contact?.contactName ?? '',
      email: contact?.email ?? '',
      phone: contact?.phone ?? '',
    });
  }, [contact]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: EditContactDialogFields }) => {
    await onSubmit(value);
    onClose();
  };

  return (
    <Modal title={'Aktualizovať kontakt'} onClose={onClose} width="medium">
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="Meno" name="contactName" required />
        <FormField label="E-mail" name="email" required />
        <FormField label="Telefón" name="phone" required />
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={'Uložiť'} />
        </Box>
      </Form>
    </Modal>
  );
}
