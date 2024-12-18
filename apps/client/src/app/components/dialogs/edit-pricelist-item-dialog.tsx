import React, { useEffect } from 'react';
import { Box, Button, Form, FormField, TextInput, Text } from 'grommet';
import { useState } from 'react';
import { Modal } from '../modal';
import { PricelistItemInput } from '../../_generated/graphql';

interface EditPricelistItemDialogProps {
  show?: boolean;
  title?: string;
  item: PricelistItemInput;
  onClose: () => void;
  onSubmit?: (values: FormFields) => unknown;
  disable?: { name?: boolean; price?: boolean };
}

interface FormFields {
  id?: string | null;
  /** item name */
  n: string;
  /** unit price */
  up: number;
}

export function EditPricelistItemDialog(props: EditPricelistItemDialogProps) {
  const { show, item, onClose, onSubmit } = props;
  const [formValues, setFormValues] = useState<FormFields>();

  useEffect(() => {
    setFormValues({
      id: item.id,
      n: item.n ?? '',
      up: item.up ?? 1.0,
    });
  }, [item]);

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    onSubmit &&
      (await onSubmit({
        ...value,
        up: Number(value.up) ?? 0,
      }));
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <Modal
      title={props.title ? props.title : 'Položka'}
      onClose={onClose}
      width="medium"
      height="auto"
    >
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="Názov" name="n" required>
          <TextInput name="n" disabled={props.disable?.name} />
        </FormField>

        <FormField label="Jednotková cena" name="up">
          <TextInput type="number" name="up" step={0.01} disabled={props.disable?.price} />
        </FormField>
        {props.disable?.price && (
          <Text size="small">Cenu nie je možné meniť. Už existujú objednávky s týmto typom.</Text>
        )}

        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label="Uložiť" />
        </Box>
      </Form>
    </Modal>
  );
}
