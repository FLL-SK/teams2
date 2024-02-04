import React, { useEffect, useState } from 'react';
import { Box, Button, CheckBox, Form, FormField, Paragraph } from 'grommet';
import { Modal } from '../modal';
import { useGetSettingsQuery } from '../../_generated/graphql';
import { validateEmail, validatePhone } from '@teams2/common';

interface EditUserDialogProps {
  user?: EditUserDialogFields | null;
  onClose: () => void;
  onSubmit: (data: EditUserDialogFields) => Promise<unknown>;
  show?: boolean;
  requestGdprConsent?: boolean;
}

export interface EditUserDialogFields {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  usernameOverride?: boolean | null;
  phone?: string | null;
  gdprAccepted?: boolean | null;
}

export function EditUserDialog(props: EditUserDialogProps) {
  const { onClose, onSubmit, show = true, user, requestGdprConsent } = props;
  const [formValues, setFormValues] = useState<EditUserDialogFields>();

  const { data } = useGetSettingsQuery();
  const url = data?.getSettings?.privacyPolicyUrl ?? '';

  useEffect(() => {
    setFormValues({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      username: user?.username ?? '',
      usernameOverride: false,
      phone: user?.phone ?? '',
      gdprAccepted: requestGdprConsent ? false : true,
    });
  }, [requestGdprConsent, user]);

  if (!show) {
    return null;
  }

  const handleSubmit = async ({ value }: { value: EditUserDialogFields }) => {
    await onSubmit(value);
  };

  return (
    <Modal title={'Aktualizovať profil'} onClose={onClose} width="medium" overflow={'auto'}>
      <Form
        onSubmit={handleSubmit}
        messages={{ required: 'Povinný údaj' }}
        value={formValues}
        onChange={setFormValues}
      >
        <Box gap="small">
          <FormField label="Meno" name="firstName" required autoFocus />
          <FormField label="Priezvisko" name="lastName" required />
          <FormField
            label="E-mail"
            name="username"
            required
            disabled
            validate={(f: string) =>
              validateEmail(f) ? true : { status: 'error', message: 'Nesprávny email.' }
            }
          />
          <FormField
            label="Telefón"
            name="phone"
            required
            validate={(f: string) =>
              validatePhone(f) ? true : { status: 'info', message: 'Nesprávne telefónne číslo.' }
            }
          />
          {requestGdprConsent && (
            <Box gap="small">
              <CheckBox
                toggle
                label="Súhlasím so spracovaním osobných údajov"
                name="gdprAccepted"
                required
              />

              <Box pad="small" background="status-warning">
                <Paragraph>
                  Pre pokračovanie je nevyhnutné aby ste súhlasili so spracovaním vašich osobných
                  údajov podľa <a href={url}>našich pravidiel na ochranu osobných údajov</a>. <br />
                  V prípade, že nesúhlasíte bude váš profil v ich zmysle zrušený.
                </Paragraph>
              </Box>
            </Box>
          )}
          <Box direction="row" gap="medium" justify="end">
            <Button plain onClick={onClose} label="Zrušiť" hoverIndicator />
            <Button primary type="submit" label={'Uložiť'} />
          </Box>
        </Box>
      </Form>
    </Modal>
  );
}
