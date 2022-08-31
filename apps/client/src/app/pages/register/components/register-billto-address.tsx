import React, { useState } from 'react';
import { Box, Button, Form, Text } from 'grommet';
import { Address } from './types';

import { AddressForm } from './address-form';

interface RegisterBillToAddressProps {
  address?: Address | null;
  onSubmit: (a: Address) => void;
  nextStep: () => void;
  prevStep: () => void;
  cancel: () => void;
}

type FormDataType = Address;

const emptyForm: FormDataType = {
  name: '',
  street: '',
  city: '',
  zip: '',
  countryCode: '',
  contactName: '',
  email: '',
  phone: '',
  companyNumber: '',
  taxNumber: '',
  vatNumber: '',
};

export function RegisterBillToAddress(props: RegisterBillToAddressProps) {
  const { address, onSubmit, nextStep, prevStep, cancel } = props;

  const [formData, setFormData] = useState<FormDataType>(
    address ? { ...emptyForm, ...address } : emptyForm
  );

  return (
    <Box gap="medium">
      <Text>Zadajte fakturačnú adresu.</Text>
      <Form
        onChange={setFormData}
        onReset={() => setFormData(emptyForm)}
        onSubmit={({ value }) => {
          onSubmit(value);
          nextStep();
        }}
        value={formData}
        messages={{ required: 'Povinný údaj' }}
      >
        <AddressForm hideContact />

        <Box justify="between" direction="row">
          <Button label="Späť" onClick={prevStep} />
          <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
          <Button primary label="Pokračovať" type="submit" />
        </Box>
      </Form>
    </Box>
  );
}
