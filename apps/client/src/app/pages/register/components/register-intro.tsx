import React from 'react';
import { Box, Button, Text } from 'grommet';
import { TeamFragmentFragment } from '../../../generated/graphql';

interface RegisterIntroProps {
  team?: TeamFragmentFragment;
  nextStep: () => void;
  prevStep: () => void;
}

export function RegisterIntro(props: RegisterIntroProps) {
  const { team, nextStep, prevStep } = props;
  if (!team) {
    return null;
  }
  return (
    <Box gap="medium">
      <Text>
        Začínate registráciu tímu <Text weight="bold">{team.name} </Text>
        na turnaj.
      </Text>
      <Text>
        Registrácia má nieľkoľko krokov v rámci ktorých si vyberiete program, turnaj a určíte
        fakturačnú a dodaciu adresu. Pred potvrdením registrácie budete môcť všetky údaje
        skontrolovať a upraviť.
      </Text>
      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button primary label="Pokračovať" onClick={nextStep} />
      </Box>
    </Box>
  );
}
