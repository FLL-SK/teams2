import { Box, Button, Form, FormField } from 'grommet';
import { Modal } from '../../components/modal';

interface RegisterTeamDialogProps {
  onSubmit?: (eventId: string) => Promise<unknown>;
  onClose: () => void;
  show?: boolean;
}

interface FormFields {
  programId: string;
  eventId: string;
}

export function RegisterTeamDialog(props: RegisterTeamDialogProps) {
  const { onSubmit, onClose, show } = props;
  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    if (onSubmit) {
      await onSubmit(value.eventId);
    }
    onClose();
  };

  return (
    <Modal title="Registruj tím" onClose={onClose}>
      <Form onSubmit={handleSubmit} messages={{ required: 'Povinný údaj' }}>
        <FormField label="Meno tímu" name="name" required autoFocus />
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label="Vytvoriť" />
        </Box>
      </Form>
    </Modal>
  );
}
