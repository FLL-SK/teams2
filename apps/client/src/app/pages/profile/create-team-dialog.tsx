import { Box, Button, Form, FormField } from 'grommet';
import { Modal } from '../../components/modal';

interface CreateTeamDialogProps {
  onClose: () => void;
  onSubmit: (name: string) => Promise<unknown>;
  show?: boolean;
}

interface FormFields {
  name: string;
}

export function CreateTeamDialog(props: CreateTeamDialogProps) {
  const { onClose, onSubmit, show = true } = props;

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    await onSubmit(value.name);
    onClose();
  };

  return (
    <Modal title="Create Team" onClose={onClose} footer={<></>}>
      <Form onSubmit={handleSubmit} messages={{ required: 'Povinný údaj' }}>
        <FormField label="Meno tímu" name="name" required />
        <Box direction="row" gap="small" alignContent="end">
          <Button plain onClick={onClose} label="Zrušiť" />
          <Button primary type="submit" label="Vytvoriť" />
        </Box>
      </Form>
    </Modal>
  );
}
