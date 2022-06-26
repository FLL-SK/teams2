import React from 'react';
import { Box, Button, CheckBox, Text } from 'grommet';
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

export function RegisterShipToAddress(props: RegisterShipToAddressProps) {
  const { team, details, onSubmit, nextStep, prevStep, cancel } = props;

  if (!team) {
    return null;
  }

  const formId = 'register-shipto-address';

  return (
    <Box gap="medium">
      <Text>Zadajte dodaciu adresu a osobu, ktorá prijme zásielku.</Text>
      <CheckBox
        toggle
        label="Použiť fakturačné údaje"
        checked={details.useBillTo}
        onChange={({ target }) => onSubmit(details.shipTo, target.checked)}
      />
      {!details.useBillTo && (
        <AddressForm
          formId={formId}
          value={details.shipTo}
          onSubmit={(a) => onSubmit(a, false)}
          hideOrgRegistration
        />
      )}

      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
        <Button
          primary
          label="Pokračovať"
          onClick={nextStep}
          form={formId}
          type="submit"
          disabled={!details.shipTo && !details.useBillTo}
        />
      </Box>
    </Box>
  );
}
