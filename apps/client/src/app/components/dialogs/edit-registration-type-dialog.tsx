import React, { useEffect, useState } from 'react';
import { Box, Button, Form, FormField, Select } from 'grommet';
import { Modal } from '../modal';

interface EditRegistrationTypeDialogProps {
  regTypeData?: EditRegistrationTypeDialogFields;
  onClose: () => void;
  onSubmit: (data: EditRegistrationTypeDialogFields) => Promise<unknown>;
  show?: boolean;
}

type RegType = 'NORMAL' | 'CLASS_PACK';

export interface EditRegistrationTypeDialogFields {
  type: RegType;
  teams: number;
  children: number;
  setCount: number;
}

export function EditRegistrationTypeDialog(props: EditRegistrationTypeDialogProps) {
  const { onClose, onSubmit, show = true, regTypeData } = props;
  const [formValues, setFormValues] = useState<EditRegistrationTypeDialogFields>();

  useEffect(() => {
    setFormValues({
      type: regTypeData?.type ?? 'NORMAL',
      teams: regTypeData?.teams ?? 1,
      children: regTypeData?.children ?? 0,
      setCount: regTypeData?.setCount ?? 1,
    });
  }, [regTypeData]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: EditRegistrationTypeDialogFields }) => {
    const v: EditRegistrationTypeDialogFields = value;
    if (v.type === 'NORMAL') {
      v.teams = 1;
      v.setCount = 1;
    } else {
      v.teams = parseInt(v.teams as unknown as string);
      v.setCount = parseInt(v.setCount as unknown as string);
    }
    v.children = parseInt(v.children as unknown as string);
    await onSubmit(v);
    onClose();
  };

  return (
    <Modal title={'Aktualizovať typ registrácie'} onClose={onClose} width="medium">
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="Typ" name="type" required>
          <Select options={['NORMAL', 'CLASS_PACK']} name="type" />
        </FormField>
        <FormField label="Počet detí" name="children" type="number" required />
        {formValues?.type === 'CLASS_PACK' && (
          <>
            <FormField label="Počet tímov" name="teams" type="number" required />
            <FormField label="Počet setov" name="setCount" type="number" required />
          </>
        )}

        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={'Uložiť'} />
        </Box>
      </Form>
    </Modal>
  );
}
