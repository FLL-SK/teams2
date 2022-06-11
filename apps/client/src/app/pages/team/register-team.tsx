import { Box, Button, Form, FormField, Select } from 'grommet';
import { useState, useMemo } from 'react';
import { Modal } from '../../components/modal';
import { useGetEventsQuery, useGetProgramsQuery } from '../../generated/graphql';

interface RegisterTeamDialogProps {
  onSubmit?: (eventId: string) => Promise<unknown>;
  onClose: () => void;
  show?: boolean;
}

interface FormFields {
  programId?: string;
  eventId?: string;
}

export function RegisterTeamDialog(props: RegisterTeamDialogProps) {
  const { onSubmit, onClose, show } = props;
  const { data: programsData } = useGetProgramsQuery({ variables: { filter: { isActive: true } } });
  const { data: eventsData } = useGetEventsQuery({ variables: { filter: { isActive: true } } });
  const [formValues, setFormValues] = useState<FormFields>({
    programId: '',
    eventId: '',
  });

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    if (onSubmit) {
      await onSubmit(value.eventId ?? '0');
    }
    onClose();
  };

  const programs = programsData?.getPrograms ?? [];

  const programEvents = useMemo(
    () => (eventsData?.getEvents ?? []).filter((e) => e.programId === formValues.programId),
    [eventsData, formValues.programId]
  );

  if (!show) {
    return null;
  }

  return (
    <Modal title="Registruj tím na turnaj" onClose={onClose}>
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        onChange={setFormValues}
        onReset={() => setFormValues({})}
      >
        <FormField label="Program" name="programId" required autoFocus>
          <Select
            name="programId"
            options={programs}
            labelKey={(p) => p.name}
            valueKey={{ key: 'id', reduce: true }}
          />
        </FormField>
        <FormField label="Turnaj" name="eventId" required>
          <Select
            name="eventId"
            options={programEvents}
            labelKey={(e) => e.name}
            valueKey={{ key: 'id', reduce: true }}
          />
        </FormField>
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label="Registrovať" />
        </Box>
      </Form>
    </Modal>
  );
}
