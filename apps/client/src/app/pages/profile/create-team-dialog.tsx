import React from 'react';
import { Box, Button, Form, FormField, Grid } from 'grommet';
import { Modal } from '../../components/modal';
import { CreateTeamInput } from '../../generated/graphql';

interface CreateTeamDialogProps {
  onClose: () => void;
  onSubmit: (data: Omit<CreateTeamInput, 'phone' | 'contactName' | 'email'>) => Promise<unknown>;
  show?: boolean;
}

interface FormFields {
  name: string;
  orgName: string;
  street: string;
  city: string;
  zip: string;
}

export function CreateTeamDialog(props: CreateTeamDialogProps) {
  const { onClose, onSubmit, show = true } = props;

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    await onSubmit(value);
    onClose();
  };

  return (
    <Modal title="Nový tím" onClose={onClose} width="large">
      <Form onSubmit={handleSubmit} messages={{ required: 'Povinný údaj' }}>
        <FormField label="Meno tímu" name="name" required autoFocus />
        <FormField label="Názov zriaďovateľa" name="orgName" required />
        <FormField label="Adresa/ulica" name="street" required />
        <Grid columns={['4fr', '1fr']} gap="small">
          <FormField label="Mesto" name="city" required />
          <FormField label="PSČ" name="zip" required />
        </Grid>
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label="Vytvoriť" />
        </Box>
      </Form>
    </Modal>
  );
}
