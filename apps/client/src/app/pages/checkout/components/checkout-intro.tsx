import React from 'react';
import { Box, Button, Paragraph, Text } from 'grommet';
import { TeamFragmentFragment } from '../../../_generated/graphql';

interface CheckoutIntroProps {
  team: TeamFragmentFragment;
  regType: 'EVENT' | 'PROGRAM';
  nextStep: () => void;
  prevStep: () => void;
}

export function CheckoutIntro(props: CheckoutIntroProps) {
  const { team, nextStep, prevStep, regType } = props;
  if (!team) {
    return null;
  }
  return (
    <Box gap="medium">
      <Paragraph style={{ maxWidth: '100%' }}>
        Začínate registráciu tímu <Text weight="bold">{team.name} </Text>
        <br />
        Registrácia má nieľkoľko krokov v rámci ktorých si vyberiete
        {regType === 'PROGRAM' ? ' program' : ' turnaj'} a určíte fakturačnú a adresu na dodanie
        materiálov. Pred odoslaním požiadavky na registráciu budete môcť všetky údaje skontrolovať a
        upraviť.
      </Paragraph>
      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button primary label="Pokračovať" onClick={nextStep} />
      </Box>
    </Box>
  );
}
