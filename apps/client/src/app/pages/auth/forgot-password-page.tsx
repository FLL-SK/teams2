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

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuthenticate();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();

  const handleRequestPasswordReset = async ({ value }: { value: { username: string } }) => {
    const resp = await forgotPassword(value.username);
    if (resp) {
      setMessage('Ak je užívateľ v systéme, dostanete email s inštrukciami.');
      return;
    } else {
      setMessage('Nepodarilo sa odoslať požiadavku na reset hesla.');
    }
  };

  return (
    <BasePage>
      <Layer>
        <Card height={{ min: '400px' }} width="medium" background="light-1">
          <CardHeader pad="medium">
            <Text size="large" weight="bold">
              Zabudnuté heslo
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
                  <Button primary type="submit" label="Požiadať o reset hesla" />
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
            <Anchor onClick={() => navigate(appPath.login)}>Poznáte vaše heslo?</Anchor>
          </CardFooter>
        </Card>
      </Layer>
    </BasePage>
  );
}
