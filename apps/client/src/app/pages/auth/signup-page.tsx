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
import { useAuthenticate } from '../../components/useAuthenticate';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuthenticate();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  const handleRequestPasswordReset = async ({
    value,
  }: {
    value: { username: string; password: string };
  }) => {
    const resp = await signup(value.username, value.password);
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
                  onSubmit={handleRequestPasswordReset}
                  messages={{ required: 'Povinný údaj' }}
                  onChange={() => setError(undefined)}
                >
                  <FormField label="E-mail" name="username" required />
                  <FormField label="Heslo" name="password" required />
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
