import React from 'react';
import { appPath, validateEmail } from '@teams2/common';
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
  Paragraph,
  Text,
} from 'grommet';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { useAuthenticate } from '@teams2/auth-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword } = useAuthenticate();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<JSX.Element>();

  const handleRequestPasswordReset = async ({ value }: { value: { username: string } }) => {
    const resp = await forgotPassword(value.username);
    if (resp) {
      setMessage(
        <>
          <Paragraph>
            Ak pre vami zadaný e-mail existuje v tomto systéme aktívny účet, tak vám naň do 5 minút
            pošleme inštrukcie na obnovu hesla.
          </Paragraph>
          <Paragraph>
            Ak ich nedostanete,
            <strong> skontrolujte aj priečinok s nevyžiadanou poštou, tzv. &quot;spam&quot;</strong>
            .
          </Paragraph>
          <Paragraph>Ak ich nenájdete ani tam, tak nás kontaktujte.</Paragraph>
        </>
      );
      return;
    } else {
      setMessage(<Paragraph>Nepodarilo sa odoslať požiadavku na obnovenie hesla.</Paragraph>);
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
                  <FormField
                    label="E-mail"
                    name="username"
                    required
                    validate={(f: string) =>
                      validateEmail(f) ? true : { status: 'error', message: 'Nesprávny email.' }
                    }
                  />
                  <Button primary type="submit" label="Požiadať o obnovu hesla" />
                </Form>
                <Box pad="small" justify="center">
                  {error && <Text color="status-error">{error}</Text>}
                </Box>
              </>
            )}
            {message && (
              <Box gap="medium">
                {message}
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
