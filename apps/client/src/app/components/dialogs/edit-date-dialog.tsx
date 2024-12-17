import React, { useEffect, useState } from 'react';
import { Box, Button, DateInput, Form, FormField, TextInput } from 'grommet';
import { Modal } from '../modal';
import { validateEmail } from '@teams2/common';

interface EditDateDialogProps {
  title?: string;
  date?: string | null;
  onClose: () => void;
  onSubmit: (data: EditDateDialogFields) => Promise<unknown> | unknown;
  show?: boolean;
}

export interface EditDateDialogFields {
  date: string;
}

export function EditDateDialog(props: EditDateDialogProps) {
  const { onClose, onSubmit, show = true, date, title } = props;
  const [formValues, setFormValues] = useState<EditDateDialogFields>();

  useEffect(() => {
    setFormValues({
      date: date ?? new Date().toISOString(),
    });
  }, [date]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: EditDateDialogFields }) => {
    await onSubmit(value);
    onClose();
  };

  return (
    <Modal title={title ?? 'Aktualizovať dátum'} onClose={onClose} width="medium">
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="Dátum" name="date" required>
          <DateInput name="date" format="dd.mm.yyyy" />
        </FormField>
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={'Uložiť'} />
        </Box>
      </Form>
    </Modal>
  );
}
