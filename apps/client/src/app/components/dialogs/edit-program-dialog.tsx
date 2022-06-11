import { Box, Button, Form, FormField } from 'grommet';
import { ProgramListFragmentFragment } from '../../generated/graphql';
import { Modal } from '../modal';

interface EditProgramDialogProps {
  show?: boolean;
  program?: ProgramListFragmentFragment;
  onClose: () => void;
  onSubmit: (values: FormFields) => Promise<unknown>;
}

interface FormFields {
  name: string;
  description: string;
}

export function EditProgramDialog(props: EditProgramDialogProps) {
  const { show, program, onClose, onSubmit } = props;

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    await onSubmit(value);
    onClose();
  };

  return (
    <Modal
      title={!program ? 'Nový program' : 'Detaily programu'}
      onClose={onClose}
      width="large"
      height="medium"
    >
      <Form onSubmit={handleSubmit} messages={{ required: 'Povinný údaj' }}>
        <FormField label="Názov" name="name" required autoFocus defaultValue={program?.name} />
        <FormField
          label="Popis"
          name="description"
          defaultValue={program?.description ?? undefined}
        />
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={!program ? 'Vytvoriť' : 'Uložiť'} />
        </Box>
      </Form>
    </Modal>
  );
}
