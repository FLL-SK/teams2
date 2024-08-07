import React from 'react';
import { Box, Button, Paragraph } from 'grommet';

import { Contact, CheckoutDetails } from './types';

import { appPath } from '@teams2/common';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';

interface CheckoutConfirmBillToContactProps {
  details: CheckoutDetails;
  contact: Contact;
  nextStep: (details: CheckoutDetails) => void;
  prevStep: () => void;
  cancel: () => void;
}

export function CheckoutConfirmBillToContact(props: CheckoutConfirmBillToContactProps) {
  const { details, nextStep, prevStep, cancel, contact } = props;

  return (
    <Box gap="medium">
      <Paragraph style={{ maxWidth: '100%' }}>
        Potvrďte vaše kontaktné údaje.
        <br />
        <br />
        Ak je vyžadovaná platba, tak na váš email bude zaslaná faktúra.
        <br />
        <br />
        Prípadnú zmenu kontaktových údajov môžete vykonať v časti{' '}
        <a href={appPath.profile(contact.id)}>„Môj profil“</a>.
      </Paragraph>

      <LabelValueGroup labelWidth={'200px'} gap="small">
        <LabelValue label="Celé meno" value={contact.name} />
        <LabelValue label="Telefón" value={contact.phone} />
        <LabelValue label="Email" value={contact.email} />
      </LabelValueGroup>

      <Box justify="between" direction="row">
        <Button label="Späť" onClick={prevStep} />
        <Button plain label="Zrušiť" hoverIndicator onClick={cancel} />
        <Button
          primary
          label="Pokračovať"
          onClick={() => {
            const d = { ...details, billToContact: contact };
            nextStep(d);
          }}
          disabled={!contact.email}
        />
      </Box>
    </Box>
  );
}
