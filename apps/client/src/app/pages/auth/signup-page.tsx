import React, { useEffect } from 'react';

import { Box, Button, CheckBox, Form, FormField, Paragraph, Text } from 'grommet';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { useAuthenticate } from '../../components/auth/useAuthenticate';
import { SignupDataType } from '../../components/auth/auth-provider';
import { useGetSettingsQuery } from '../../generated/graphql';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuthenticate();
  const [message, setMessage] = useState<string>();
  const [formValues, setFormValues] = useState<SignupDataType>();

  const { data } = useGetSettingsQuery();
  const url = data?.getSettings?.privacyPolicyUrl ?? '';

  useEffect(() => {
    setFormValues({
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      passwordConfirm: '',
      phone: '',
      gdprAccepted: false,
    });
  }, []);

  const handleSignup = async ({ value }: { value: SignupDataType }) => {
    const resp = await signup(value);
    if (resp) {
      setMessage('Účet vytvorený. Môžete sa prihlásiť.');
      return;
    } else {
      setMessage('Nepodarilo sa vytvoriť účet.');
    }
  };

  return (
    <BasePage title="Vytvorenie účtu">
      <Box gap="small" width={{ max: '500px' }}>
        <Form
          onSubmit={handleSignup}
          messages={{ required: 'Povinný údaj' }}
          onChange={setFormValues}
          value={formValues}
          validate="submit"
        >
          <Box gap="small">
            <FormField label="Meno" name="firstName" required />
            <FormField label="Priezvisko" name="lastName" required />
            <FormField label="Telefón" name="phone" required />
            <FormField label="E-mail" name="username" required />
            <FormField label="Heslo" name="password" type="password" required />
            <FormField
              label="Heslo znova"
              name="passwordConfirm"
              type="password"
              required
              validate={(f: string, ff: SignupDataType) =>
                ff.password === ff.passwordConfirm
                  ? true
                  : { status: 'error', message: 'Heslá sa nezhodujú' }
              }
            />

            <CheckBox
              label="Súhlasím so spracovaním osobných údajov"
              name="gdprAccepted"
              required
            />

            <Box pad="small" background="status-warning">
              <Paragraph>
                Pre pokračovanie je nevyhnutné aby ste súhlasili so spracovaním vašich osobných
                údajov podľa <a href={url}>našich pravidiel na ochranu osobných údajov</a>.
              </Paragraph>
            </Box>

            <Box direction="row" align="center">
              <Button primary type="submit" label="Vytvoriť účet" />
            </Box>
          </Box>
        </Form>

        <Box gap="medium">
          <Text>{message}</Text>
          <Box direction="row">
            <Button primary label="OK" onClick={() => navigate('/login')} />
          </Box>
        </Box>
      </Box>
    </BasePage>
  );
}
