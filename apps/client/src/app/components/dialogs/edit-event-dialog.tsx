import React from 'react';
import { toUtcDateString, toZonedDateString } from '@teams2/dateutils';
import { Box, Button, DateInput, Form, FormField, Grid, TextArea, TextInput } from 'grommet';
import { useState } from 'react';

import { EventListFragmentFragment } from '../../generated/graphql';
import { Modal } from '../modal';

interface EditEventDialogProps {
  show?: boolean;
  event?: EventListFragmentFragment;
  onClose: () => void;
  onSubmit?: (values: FormFields) => Promise<unknown>;
}

interface FormFields {
  name: string;
  date?: string; // UTC ISO date
  registrationEnd?: string; // UTC ISO date
  conditions?: string;
}

export function EditEventDialog(props: EditEventDialogProps) {
  const { show, event, onClose, onSubmit } = props;
  const [formValues, setFormValues] = useState<FormFields>({
    name: event?.name ?? '',
    date: toZonedDateString(event?.date),
    registrationEnd: toZonedDateString(event?.registrationEnd),
    conditions: event?.conditions ?? '',
  });

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    onSubmit &&
      (await onSubmit({
        ...value,
        date: toUtcDateString(value.date),
        registrationEnd: toUtcDateString(value.registrationEnd),
      }));
    onClose();
  };

  return (
    <Modal
      title={!event ? 'Nový turnaj' : 'Detaily turnaja'}
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
        <Grid columns={['1fr', '1fr']} gap="small">
          <FormField label="Dátum turnaja" name="date">
            <DateInput name="date" format="dd.mm.yyyy" />
          </FormField>
          <FormField label="Termín registrácie" name="registrationEnd">
            <DateInput name="registrationEnd" format="dd.mm.yyyy" />
          </FormField>
        </Grid>
        <FormField label="Podmienky" name="conditions">
          <TextArea rows={10} name="conditions" />
        </FormField>

        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={!event ? 'Vytvoriť' : 'Uložiť'} />
        </Box>
      </Form>
    </Modal>
  );
}
