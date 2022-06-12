import { Box, Button, Text } from 'grommet';
import { TeamFragmentFragment } from '../../../generated/graphql';
import { Address, RegisterDetails } from './types';

import { AddressForm } from './address-form';

interface RegisterShipToAddressProps {
  team?: TeamFragmentFragment;
  details: RegisterDetails;
  onSubmit: (a: Address) => void;
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
      <AddressForm formId={formId} value={details.shipTo} onSubmit={onSubmit} hideOrgRegistration />

      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
        <Button
          primary
          label="Pokračovať"
          onClick={nextStep}
          form={formId}
          type="submit"
          disabled={!details.shipTo}
        />
      </Box>
    </Box>
  );
}
