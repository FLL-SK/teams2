import React from 'react';
import { Box, Button, Paragraph } from 'grommet';

import { RegisterDetails } from './types';

import { appPath } from '@teams2/common';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { useAppUser } from '../../../components/app-user/use-app-user';

interface RegisterConfirmBillToContactProps {
  details: RegisterDetails;
  nextStep: () => void;
  prevStep: () => void;
  cancel: () => void;
}

export function RegisterConfirmBillToContact(props: RegisterConfirmBillToContactProps) {
  const { details, nextStep, prevStep, cancel } = props;
  const { user } = useAppUser();

  return (
    <Box gap="medium">
      <Paragraph style={{ maxWidth: '100%' }}>
        Potvrďte vaše kontaktné údaje.
        <br />
        <br />
        Ak turnaj, na ktorý sa registrujete, vyžaduje zaplatenie poplatku, tak na váš email bude
        zaslaná faktúra.
        <br />
        <br />
        Prípadnú zmenu kontaktových údajov môžete vykonať v časti{' '}
        <a href={appPath.profile(user?.id)}>„Môj profil“</a>.
      </Paragraph>

      <LabelValueGroup labelWidth={'200px'} gap="small">
        <LabelValue label="Celé meno" value={details.billTo?.contactName} />
        <LabelValue label="Telefón" value={details.billTo?.phone} />
        <LabelValue label="Email" value={details.billTo?.email} />
      </LabelValueGroup>

      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
        <Button primary label="Pokračovať" onClick={nextStep} />
      </Box>
    </Box>
  );
}
