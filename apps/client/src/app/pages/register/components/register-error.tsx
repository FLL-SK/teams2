import React from 'react';
import { Box, Button, Text } from 'grommet';
import { TeamFragmentFragment } from '../../../generated/graphql';
import { RegisterDetails } from './types';

interface RegisterErrorProps {
  team?: TeamFragmentFragment;
  details: RegisterDetails;
  nextStep: () => void;
}

export function RegisterError(props: RegisterErrorProps) {
  const { team, nextStep } = props;

  if (!team) {
    return null;
  }

  return (
    <Box gap="medium">
      <Text>Registrácia sa nepodarila. Skúste neskôr, alebo kontaktujte podporu.</Text>

      <Box justify="between" direction="row">
        <Button primary label="Dokončiť" onClick={nextStep} />
      </Box>
    </Box>
  );
}
