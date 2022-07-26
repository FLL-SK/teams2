import React, { useState } from 'react';
import { Box, Button, CheckBox, Form, Text } from 'grommet';
import { TeamFragmentFragment } from '../../../generated/graphql';
import { Address, RegisterDetails } from './types';

import { AddressForm } from './address-form';

interface RegisterShipToAddressProps {
  team?: TeamFragmentFragment;
  details: RegisterDetails;
  onSubmit: (a: Address | undefined, useBillTo: boolean) => void;
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
};

export function RegisterShipToAddress(props: RegisterShipToAddressProps) {
  const { team, details, onSubmit, nextStep, prevStep, cancel } = props;

  const [formData, setFormData] = useState<Address>(details.shipTo ?? emptyForm);
  const [useBillTo, setUseBillTo] = useState(false);

  if (!team) {
    return null;
  }

  return (
    <Box gap="medium">
      <Text>Zadajte dodaciu adresu a osobu, ktorá prijme zásielku.</Text>
      <CheckBox
        toggle
        label="Použiť fakturačné údaje"
        checked={details.useBillTo}
        onChange={({ target }) => setUseBillTo(target.checked)}
      />
      <Form
        onChange={setFormData}
        onReset={() => setFormData(emptyForm)}
        onSubmit={({ value }) => {
          onSubmit(value, useBillTo);
          nextStep();
        }}
        value={formData}
        messages={{ required: 'Povinný údaj' }}
      >
        {!useBillTo && <AddressForm hideOrgRegistration />}

        <Box justify="between" direction="row">
          <Button label="Späť" onClick={prevStep} />
          <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
          <Button
            primary
            label="Pokračovať"
            type="submit"
            disabled={!details.shipTo && !useBillTo}
          />
        </Box>
      </Form>
    </Box>
  );
}
