import React, { useEffect, useState } from 'react';
import { Box, Button, Form, FormField } from 'grommet';
import { Modal } from '../modal';
import { TagColorType } from '../../generated/graphql';
import { TagColorPicker } from '../tag-color-picker';

interface EditTagProps {
  label?: string | null;
  color?: TagColorType | null;
  onClose: () => void;
  onSubmit: (label: string, color: TagColorType) => Promise<unknown>;
  show?: boolean;
}

interface FormFields {
  label: string;
  color: TagColorType;
}

export function EditTagDialog(props: EditTagProps) {
  const { onClose, onSubmit, show = true, label, color } = props;
  const [formValues, setFormValues] = useState<FormFields>({
    label: label ?? '',
    color: color ?? 'TC1',
  });

  useEffect(() => {
    setFormValues({
      label: label ?? '',
      color: color ?? 'TC1',
    });
  }, [label, color]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    await onSubmit(value.label, value.color);
    onClose();
  };

  return (
    <Modal title={'Štítok'} onClose={onClose} width="medium">
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="Text" name="label" required autoFocus />
        <FormField label="Farba" name="color" required autoFocus>
          <TagColorPicker
            selected={formValues?.color ?? 'TC1'}
            onChange={(color) => setFormValues({ ...formValues, color })}
          />
        </FormField>
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label="Uložiť" />
        </Box>
      </Form>
    </Modal>
  );
}
