import { Box, Button, Text } from 'grommet';
import { TeamFragmentFragment } from '../../../generated/graphql';
import { RegisterDetails } from './types';

interface RegisterSuccessProps {
  team?: TeamFragmentFragment;
  details: RegisterDetails;
  nextStep: () => void;
}

export function RegisterSuccess(props: RegisterSuccessProps) {
  const { team, details, nextStep } = props;

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
