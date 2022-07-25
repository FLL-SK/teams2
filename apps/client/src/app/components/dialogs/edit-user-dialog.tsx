import React, { useEffect, useState } from 'react';
import { Box, Button, Form, FormField } from 'grommet';
import { Modal } from '../modal';

interface EditUserDialogProps {
  user?: EditUserDialogFields | null;
  onClose: () => void;
  onSubmit: (data: EditUserDialogFields) => Promise<unknown>;
  show?: boolean;
}

export interface EditUserDialogFields {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

export function EditUserDialog(props: EditUserDialogProps) {
  const { onClose, onSubmit, show = true, user } = props;
  const [formValues, setFormValues] = useState<EditUserDialogFields>();

  useEffect(() => {
    setFormValues({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
    });
  }, [user]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: EditUserDialogFields }) => {
    await onSubmit(value);
    onClose();
  };

  return (
    <Modal title={'Aktualizovať profil'} onClose={onClose} width="medium">
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="Meno" name="firstName" required />
        <FormField label="Priezvisko" name="lastName" required />
        <FormField label="Telefón" name="phone" required />
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={'Uložiť'} />
        </Box>
      </Form>
    </Modal>
  );
}
