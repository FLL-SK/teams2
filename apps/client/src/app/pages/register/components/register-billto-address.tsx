import React from 'react';
import { Box, Button, Text } from 'grommet';
import { TeamFragmentFragment } from '../../../generated/graphql';
import { Address, RegisterDetails } from './types';

import { AddressForm } from './address-form';

interface RegisterBillToAddressProps {
  team?: TeamFragmentFragment;
  details: RegisterDetails;
  onSubmit: (a: Address) => void;
  nextStep: () => void;
  prevStep: () => void;
  cancel: () => void;
}

export function RegisterBillToAddress(props: RegisterBillToAddressProps) {
  const { team, details, onSubmit, nextStep, prevStep, cancel } = props;

  if (!team) {
    return null;
  }

  const formId = 'register-billto-address';

  return (
    <Box gap="medium">
      <Text>Zadajte fakturačnú adresu a kontaktnú osobu pre zaslanie a úhradu faktúry.</Text>
      <AddressForm formId={formId} value={details.billTo ?? team.address} onSubmit={onSubmit} />

      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
        <Button
          primary
          label="Pokračovať"
          onClick={nextStep}
          form={formId}
          type="submit"
          disabled={!details.billTo}
        />
      </Box>
    </Box>
  );
}
