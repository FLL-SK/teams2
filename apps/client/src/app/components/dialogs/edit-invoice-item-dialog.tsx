import React, { useEffect } from 'react';
import { Box, Button, CheckBox, Form, FormField, Grid, TextInput } from 'grommet';
import { useState } from 'react';

import { InvoiceItemFragmentFragment } from '../../_generated/graphql';
import { Modal } from '../modal';

interface EditInvoiceItemDialogProps {
  show?: boolean;
  item?: InvoiceItemFragmentFragment;
  onClose: () => void;
  onSubmit?: (values: FormFields) => unknown;
}

interface FormFields {
  id?: string;
  lineNo: number;
  text: string;
  note?: string;
  unitPrice: number;
  quantity: number;
  public?: boolean;
}

export function EditInvoiceItemDialog(props: EditInvoiceItemDialogProps) {
  const { show, item, onClose, onSubmit } = props;
  const [formValues, setFormValues] = useState<FormFields>();

  useEffect(() => {
    setFormValues({
      id: item?.id,
      lineNo: item?.lineNo ?? 1,
      text: item?.text ?? '',
      note: item?.note ?? '',
      unitPrice: item?.unitPrice ?? 1.0,
      quantity: item?.quantity ?? 1.0,
      public: item?.public ?? false,
    });
  }, [item]);

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    onSubmit &&
      (await onSubmit({
        ...value,
        lineNo: Number(value.lineNo) ?? 1,
        quantity: Number(value.quantity) ?? 1,
        unitPrice: Number(value.unitPrice) ?? 1,
      }));
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <Modal
      title={!item ? 'Poplatok - nová položka' : 'Poplatok - položka'}
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
        <FormField label="Čislo riadku" name="lineNo" required autoFocus>
          <TextInput type="number" name="lineNo" />
        </FormField>
        <FormField label="Text" name="text" required>
          <TextInput name="text" />
        </FormField>
        <FormField label="Poznámka" name="note">
          <TextInput name="note" />
        </FormField>
        <FormField label="Verejne viditeľná" name="public">
          <CheckBox name="public" toggle />
        </FormField>

        <Grid columns={['1fr', '1fr']} gap="small">
          <FormField label="Jednotková cena" name="unitPrice">
            <TextInput type="number" name="unitPrice" />
          </FormField>
          <FormField label="Množstvo" name="quantity">
            <TextInput type="number" name="quantity" />
          </FormField>
        </Grid>

        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={!item ? 'Vytvoriť' : 'Uložiť'} />
        </Box>
      </Form>
    </Modal>
  );
}
