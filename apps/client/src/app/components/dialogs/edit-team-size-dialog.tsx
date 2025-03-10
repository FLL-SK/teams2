import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Form, FormField } from 'grommet';
import { Modal } from '../modal';

interface EditTeamSizeDialogProps {
  teamSize?: FormFields | null;
  onClose: () => void;
  onSubmit: (field: FormFields) => Promise<unknown>;
  show?: boolean;
}

interface FormFields {
  girlCount: number;
  boyCount: number;
  coachCount: number;
}

export function EditTeamSizeDialog(props: EditTeamSizeDialogProps) {
  const { onClose, onSubmit, show = true, teamSize } = props;

  const v = useCallback(
    () => ({
      girlCount: teamSize?.girlCount ?? 0,
      boyCount: teamSize?.boyCount ?? 0,
      coachCount: teamSize?.coachCount ?? 0,
    }),
    [teamSize],
  );

  const [formValues, setFormValues] = useState<FormFields>(v());

  useEffect(() => {
    setFormValues(v());
  }, [v]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: FormFields }) => {
    await onSubmit(value);
    onClose();
  };

  return (
    <Modal title={'Počet členov tímu'} onClose={onClose} width="medium">
      <Form onSubmit={handleSubmit} messages={{ required: 'Povinný údaj' }} value={formValues}>
        <FormField
          label="Dievčatá"
          type="number"
          name="girlCount"
          required
          autoFocus
          onChange={({ target }) =>
            setFormValues({ ...formValues, girlCount: Number(target.value) ?? 0 })
          }
        />
        <FormField
          label="Chlapci"
          name="boyCount"
          type="number"
          required
          onChange={({ target }) =>
            setFormValues({ ...formValues, boyCount: Number(target.value) ?? 0 })
          }
        />
        <FormField
          label="Tréneri"
          name="coachCount"
          type="number"
          required
          onChange={({ target }) =>
            setFormValues({ ...formValues, coachCount: Number(target.value) ?? 0 })
          }
        />
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label="Uložiť" />
        </Box>
      </Form>
    </Modal>
  );
}
