import React, { useEffect, useState } from 'react';
import { Box, Button, Form, FormField } from 'grommet';
import { Modal } from '../modal';

interface EditCompanyRegDialogProps {
  companyReg?: EditCompanyRegDialogFields;
  onClose: () => void;
  onSubmit: (data: EditCompanyRegDialogFields) => Promise<unknown>;
  show?: boolean;
}

export interface EditCompanyRegDialogFields {
  companyNumber?: string | null;
  taxNumber?: string | null;
  vatNumber?: string | null;
}

export function EditCompanyRegDialog(props: EditCompanyRegDialogProps) {
  const { onClose, onSubmit, show = true, companyReg } = props;
  const [formValues, setFormValues] = useState<EditCompanyRegDialogFields>();

  useEffect(() => {
    setFormValues({
      companyNumber: companyReg?.companyNumber ?? '',
      taxNumber: companyReg?.taxNumber ?? '',
      vatNumber: companyReg?.vatNumber ?? '',
    });
  }, [companyReg]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: EditCompanyRegDialogFields }) => {
    await onSubmit(value);
    onClose();
  };

  return (
    <Modal title={'Aktualizovať údaje'} onClose={onClose} width="medium">
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <FormField label="IČO" name="companyNumber" required />
        <FormField label="DIČ" name="taxNumber" required />
        <FormField label="IČ-DPH" name="vatNumber" required />
        <Box direction="row" gap="medium" justify="end">
          <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
          <Button primary type="submit" label={'Uložiť'} />
        </Box>
      </Form>
    </Modal>
  );
}
