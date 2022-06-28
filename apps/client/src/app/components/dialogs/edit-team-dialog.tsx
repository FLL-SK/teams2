import React, { useEffect, useState } from 'react';
import { Box, Button, Form, FormField, Grid } from 'grommet';
import { Modal } from '../modal';
import { CreateTeamInput, TeamListFragmentFragment } from '../../generated/graphql';

interface EditTeamDialogProps {
  team?: TeamListFragmentFragment;
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

export function EditTeamDialog(props: EditTeamDialogProps) {
  const { onClose, onSubmit, show = true, team } = props;
  const [formValues, setFormValues] = useState<FormFields>();

  useEffect(() => {
    setFormValues({
      name: team?.name ?? '',
      orgName: team?.address.name ?? '',
      street: team?.address.street ?? '',
      city: team?.address.city ?? '',
      zip: team?.address.zip ?? '',
    });
  }, [team]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    await onSubmit(value);
    onClose();
  };

  return (
    <Modal title={team ? 'Detaily tímu' : 'Nový tím'} onClose={onClose} width="large">
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="Meno tímu" name="name" required autoFocus />
        <FormField label="Názov zriaďovateľa" name="orgName" required />
        <FormField label="Adresa/ulica" name="street" required />
        <Grid columns={['4fr', '1fr']} gap="small">
          <FormField label="Mesto" name="city" required />
          <FormField label="PSČ" name="zip" required />
        </Grid>
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={team ? 'Uložiť' : 'Vytvoriť'} />
        </Box>
      </Form>
    </Modal>
  );
}
