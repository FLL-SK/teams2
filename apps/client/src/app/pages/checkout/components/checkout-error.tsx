import React from 'react';
import { Box, Button, Text } from 'grommet';
import { TeamFragmentFragment } from '../../../_generated/graphql';
import { CheckoutDetails } from './types';

interface CheckoutErrorProps {
  team?: TeamFragmentFragment;
  details: CheckoutDetails;
  nextStep: () => void;
}

export function CheckoutError(props: CheckoutErrorProps) {
  const { team, nextStep } = props;

  if (!team) {
    return null;
  }

  return (
    <Box gap="medium">
      <Text>Nepodarilo sa odoslať vašu požiadavku. Skúste neskôr, alebo kontaktujte podporu.</Text>

      <Box justify="between" direction="row">
        <Button primary label="Dokončiť" onClick={nextStep} />
      </Box>
    </Box>
  );
}
