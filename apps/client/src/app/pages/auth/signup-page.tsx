import React from 'react';
import { appPath } from '@teams2/common';
import {
  Anchor,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Form,
  FormField,
  Layer,
  Text,
} from 'grommet';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { useAuthenticate } from '../../components/auth/useAuthenticate';
import { SignupDataType } from '../../components/auth/auth-provider';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuthenticate();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

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
    <BasePage>
      <Layer>
        <Card height={{ min: '400px' }} width="medium" background="light-1">
          <CardHeader pad="medium">
            <Text size="large" weight="bold">
              Vytvorenie účtu
            </Text>
          </CardHeader>
          <CardBody pad={{ vertical: 'small', horizontal: 'medium' }}>
            {!message && (
              <>
                <Form
                  onSubmit={handleSignup}
                  messages={{ required: 'Povinný údaj' }}
                  onChange={() => setError(undefined)}
                >
                  <FormField label="Meno" name="firstName" required />
                  <FormField label="Priezvisko" name="lastName" required />
                  <FormField label="Telefón" name="phone" required />
                  <FormField label="E-mail" name="username" required />
                  <FormField label="Heslo" name="password" type="password" required />
                  <Button primary type="submit" label="Vytvoriť účet" />
                </Form>
                <Box pad="small" justify="center">
                  {error && <Text color="status-error">{error}</Text>}
                </Box>
              </>
            )}
            {message && (
              <Box gap="medium">
                <Text>{message}</Text>
                <Button primary label="OK" onClick={() => navigate('/login')} />
              </Box>
            )}
          </CardBody>
          <CardFooter pad={'medium'} background="light-2" justify="center">
            <Anchor onClick={() => navigate(appPath.login)}>Prihlásiť sa</Anchor>
          </CardFooter>
        </Card>
      </Layer>
    </BasePage>
  );
}
