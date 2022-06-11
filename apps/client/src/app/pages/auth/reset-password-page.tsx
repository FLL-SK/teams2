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
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { useAuthenticate } from '../../components/auth/useAuthenticate';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword } = useAuthenticate();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [params] = useSearchParams();

  const handlePasswordReset = async ({ value }: { value: { password: string } }) => {
    const token = params.get('token') ?? '';
    const resp = await resetPassword(value.password, token);
    if (resp) {
      setMessage('Heslo úspešne sa podarilo zmeniť.');
      return;
    } else {
      setMessage('Chyba pri zmene hesla.');
    }
  };

  return (
    <BasePage>
      <Layer>
        <Card height={{ min: '400px' }} width="medium" background="light-1">
          <CardHeader pad="medium">
            <Text size="large" weight="bold">
              Reset hesla
            </Text>
          </CardHeader>
          <CardBody pad={{ vertical: 'small', horizontal: 'medium' }}>
            {!message && (
              <>
                <Form
                  onSubmit={handlePasswordReset}
                  messages={{ required: 'Povinný údaj' }}
                  onChange={() => setError(undefined)}
                >
                  <FormField label="Heslo" name="password" required type="password" />
                  <FormField
                    label="Heslo ešte raz"
                    name="password2"
                    required
                    type="password"
                    validate={(f, frm) =>
                      frm.password !== frm.password2 ? 'Heslá musia byť rovnaké.' : undefined
                    }
                  />
                  <Button primary type="submit" label="Nastaviť nové heslo" />
                </Form>
                <Box pad="medium" justify="center">
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
