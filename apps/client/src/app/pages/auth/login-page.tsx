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
import { useLocation, useNavigate } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { useAuthenticate } from '../../components/auth/useAuthenticate';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthenticate();

  const [error, setError] = useState<string>();

  const handleLogin = async ({ value }: { value: { username: string; password: string } }) => {
    const resp = await login(value.username, value.password);
    if (resp.user) {
      const l = (location.state as { from?: string })?.from ?? appPath.home;
      navigate(l);
      return;
    } else {
      setError('Nesprávne prihlasovacie údaje');
    }
  };

  return (
    <BasePage>
      <Layer>
        <Card height={{ min: '400px' }} width="medium" background="light-1">
          <CardHeader pad="medium">
            <Text size="large" weight="bold">
              Prihlásenie
            </Text>
          </CardHeader>
          <CardBody pad={{ vertical: 'small', horizontal: 'medium' }}>
            <Form
              onSubmit={handleLogin}
              messages={{ required: 'Povinný údaj' }}
              onChange={() => setError(undefined)}
            >
              <FormField label="E-mail" name="username" required />
              <FormField label="Heslo" name="password" type="password" required />
              <Button primary type="submit" label="Prihlásiť sa" />
            </Form>
            <Box pad="small" justify="center">
              {error && <Text color="status-error">{error}</Text>}
            </Box>
          </CardBody>
          <CardFooter pad={'medium'} background="light-2" justify="center">
            <Anchor onClick={() => navigate(appPath.forgotPassword)}>Zabudli ste heslo?</Anchor>
            <Anchor onClick={() => navigate(appPath.signup)}>Vytvoriť nový účet?</Anchor>
          </CardFooter>
        </Card>
      </Layer>
    </BasePage>
  );
}
