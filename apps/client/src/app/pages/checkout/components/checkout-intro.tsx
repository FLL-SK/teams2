import React from 'react';
import { Box, Button, Paragraph, Text } from 'grommet';
import { TeamFragmentFragment } from '../../../_generated/graphql';

interface RegisterIntroProps {
  team: TeamFragmentFragment;
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
      <Paragraph style={{ maxWidth: '100%' }}>
        Začínate registráciu tímu <Text weight="bold">{team.name} </Text>
        na turnaj. <br />
        <br />
        Registrácia má nieľkoľko krokov v rámci ktorých si vyberiete program, turnaj a určíte
        fakturačnú a adresu na dodanie materiálov. Pred odoslaním požiadavky na registráciu budete
        môcť všetky údaje skontrolovať a upraviť.
      </Paragraph>
      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button primary label="Pokračovať" onClick={nextStep} />
      </Box>
    </Box>
  );
}
