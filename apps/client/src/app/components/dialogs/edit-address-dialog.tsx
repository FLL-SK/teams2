import React, { useEffect, useState } from 'react';
import { Box, Button, Form, FormField, Grid } from 'grommet';
import { Modal } from '../modal';

interface EditAddressDialogProps {
  address?: EditAddressDialogFields;
  onClose: () => void;
  onSubmit: (data: EditAddressDialogFields) => Promise<unknown>;
  show?: boolean;
}

export interface EditAddressDialogFields {
  name: string;
  street: string;
  city: string;
  zip: string;
}

export function EditAddressDialog(props: EditAddressDialogProps) {
  const { onClose, onSubmit, show = true, address } = props;
  const [formValues, setFormValues] = useState<EditAddressDialogFields>();

  useEffect(() => {
    setFormValues({
      name: address?.name ?? '',
      street: address?.street ?? '',
      city: address?.city ?? '',
      zip: address?.zip ?? '',
    });
  }, [address]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: EditAddressDialogFields }) => {
    await onSubmit(value);
    onClose();
  };

  return (
    <Modal title={'Aktualizovať adresu'} onClose={onClose} width="large">
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="Názov organizácie/osoby" name="name" required />
        <FormField label="Adresa/ulica" name="street" required />
        <Grid columns={['4fr', '1fr']} gap="small">
          <FormField label="Mesto" name="city" required />
          <FormField label="PSČ" name="zip" required />
        </Grid>
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={'Uložiť'} />
        </Box>
      </Form>
    </Modal>
  );
}
