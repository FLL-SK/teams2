import React, { useEffect } from 'react';
import { Box, Button, Form, FormField, TextArea, TextInput } from 'grommet';
import { useState } from 'react';
import { ProgramListFragmentFragment } from '../../generated/graphql';
import { Modal } from '../modal';

interface EditProgramDialogProps {
  show?: boolean;
  program?: ProgramListFragmentFragment;
  onClose: () => void;
  onSubmit: (values: FormFields) => Promise<unknown>;
}

interface FormFields {
  name: string;
  description?: string;
  conditions?: string;
}

export function EditProgramDialog(props: EditProgramDialogProps) {
  const { show, program, onClose, onSubmit } = props;
  const [formValues, setFormValues] = useState<FormFields>();

  useEffect(() => {
    setFormValues({
      name: program?.name ?? '',
      description: program?.description ?? '',
      conditions: program?.conditions ?? '',
    });
  }, [program]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    await onSubmit(value);
    onClose();
  };

  return (
    <Modal
      title={!program ? 'Nový program' : 'Detaily programu'}
      onClose={onClose}
      width="large"
      height="auto"
    >
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="Názov" name="name" required autoFocus>
          <TextInput name="name" />
        </FormField>
        <FormField label="Popis" name="description">
          <TextArea rows={10} name="description" />
        </FormField>
        <FormField label="Podmienky" name="conditions">
          <TextArea rows={10} name="conditions" />
        </FormField>
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={!program ? 'Vytvoriť' : 'Uložiť'} />
        </Box>
      </Form>
    </Modal>
  );
}
