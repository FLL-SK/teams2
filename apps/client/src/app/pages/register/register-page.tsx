import React from 'react';
import { appPath } from '@teams2/common';
import { Box } from 'grommet';
import { useCallback, useState } from 'react';
import { omitBy, isNil } from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import {
  Address,
  useCreateRegistrationInvoiceMutation,
  useEmailInvoiceMutation,
  useGetTeamQuery,
  useRegisterTeamForEventMutation,
  useUpdateTeamMutation,
} from '../../generated/graphql';
import { RegisterBillToAddress } from './components/register-billto-address';
import { RegisterIntro } from './components/register-intro';
import { RegisterReview } from './components/register-review';
import { RegisterSelectEvent } from './components/register-select-event';
import { RegisterSelectProgram } from './components/register-select-program';
import { RegisterShipToAddress } from './components/register-shipto-address';
import { RegisterDetails } from './components/types';
import { RegisterSuccess } from './components/register-success';
import { RegisterError } from './components/register-error';
import { useNotification } from '../../components/notifications/notification-provider';

type RegistrationStep =
  | 'intro'
  | 'select-event'
  | 'select-program'
  | 'review'
  | 'billto'
  | 'shipto'
  | 'success'
  | 'error';

export function RegisterPage() {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isTeamCoach } = useAppUser();
  const [step, setStep] = useState<RegistrationStep>('intro');
  const [registerDetails, setRegisterDetails] = useState<RegisterDetails>({});
  const [invoiceNo, setInvoiceNo] = useState<string | undefined>();
  const [sentOn, setSentOn] = useState<Date | undefined>();
  const [timeoutError, setTimeoutError] = useState<boolean>(false);
  const { notify } = useNotification();

  const {
    data: teamData,
    loading: teamLoading,
    error: teamError,
  } = useGetTeamQuery({
    variables: { id: teamId ?? '0' },
    onCompleted: (data) =>
      setRegisterDetails({
        ...registerDetails,
        billTo: data.getTeam.billTo ? (omitBy(data.getTeam.billTo, isNil) as Address) : undefined, // remove null/undefined values
        shipTo: data.getTeam.shipTo ? (omitBy(data.getTeam.shipTo, isNil) as Address) : undefined, // remove null/undefined values
      }),
  });
  const [updateTeam] = useUpdateTeamMutation();
  const [registerTeam] = useRegisterTeamForEventMutation();

  // creating an invoice triggers sending an email to the billing contact
  const [createInvoice] = useCreateRegistrationInvoiceMutation();
  const [emailInvoice] = useEmailInvoiceMutation();

  const canRegister = isAdmin() || isTeamCoach(teamId);
  const team = teamData?.getTeam;

  const cancel = useCallback(() => navigate(appPath.team(teamId)), [navigate, teamId]);

  const doRegister = useCallback(
    async (data: RegisterDetails) => {
      // let's assume everything is filled out properly
      const _teamId = teamId ?? '0';
      const _eventId = data.event?.id ?? '0';

      const ti = setTimeout(() => setTimeoutError(true), 5000);

      const r1 = await registerTeam({ variables: { teamId: _teamId, eventId: _eventId } });
      if (!r1.data?.registerTeamForEvent) {
        notify.fatal('Nepodarilo sa zaregistrovat tím.');
        return;
      }
      setStep('success');

      const r2 = await createInvoice({ variables: { teamId: _teamId, eventId: _eventId } });
      if (!r2.data?.createRegistrationInvoice) {
        notify.error('Nepodarilo sa vytvoriť faktúru.');
        return;
      }
      setInvoiceNo(r2.data.createRegistrationInvoice.number);

      const r3 = await emailInvoice({ variables: { id: r2.data.createRegistrationInvoice.id } });
      if (!r3.data?.emailInvoice) {
        notify.error('Nepodarilo sa odoslať faktúru emailom.');
        return;
      }
      setSentOn(r3.data.emailInvoice.sentOn ? new Date(r3.data.emailInvoice.sentOn) : undefined);

      clearTimeout(ti);
    },
    [createInvoice, emailInvoice, notify, registerTeam, teamId]
  );

  if (!teamId || teamError) {
    return <ErrorPage title="Tím nenájdený" error={teamError} />;
  }

  return (
    <BasePage title={`Registrácia tímu: ${team?.name}`} loading={teamLoading}>
      <Box>
        {step === 'intro' && (
          <RegisterIntro team={team} nextStep={() => setStep('select-program')} prevStep={cancel} />
        )}
        {step === 'select-program' && (
          <RegisterSelectProgram
            team={team}
            details={registerDetails}
            onSubmit={(p) => setRegisterDetails({ ...registerDetails, program: p })}
            nextStep={() => setStep('select-event')}
            prevStep={() => setStep('intro')}
            cancel={cancel}
          />
        )}
        {step === 'select-event' && (
          <RegisterSelectEvent
            team={team}
            details={registerDetails}
            onSubmit={(e) => setRegisterDetails({ ...registerDetails, event: e })}
            nextStep={() => setStep('billto')}
            prevStep={() => setStep('select-program')}
            cancel={cancel}
          />
        )}
        {step === 'billto' && (
          <RegisterBillToAddress
            team={team}
            details={registerDetails}
            onSubmit={(a) => {
              updateTeam({ variables: { id: teamId, input: { billTo: a } } });
              setRegisterDetails({ ...registerDetails, billTo: a });
            }}
            nextStep={() => setStep('shipto')}
            prevStep={() => setStep('select-event')}
            cancel={cancel}
          />
        )}
        {step === 'shipto' && (
          <RegisterShipToAddress
            team={team}
            details={registerDetails}
            onSubmit={(a) => {
              updateTeam({ variables: { id: teamId, input: { shipTo: a } } });
              setRegisterDetails({ ...registerDetails, shipTo: a });
            }}
            nextStep={() => setStep('review')}
            prevStep={() => setStep('shipto')}
            cancel={cancel}
          />
        )}
        {step === 'review' && (
          <RegisterReview
            team={team}
            details={registerDetails}
            prevStep={() => setStep('shipto')}
            nextStep={() => doRegister(registerDetails)}
            cancel={cancel}
          />
        )}
        {step === 'success' && (
          <RegisterSuccess
            team={team}
            details={registerDetails}
            nextStep={() => navigate(appPath.team(teamId))}
            invoiceNo={invoiceNo}
            sentOn={sentOn}
            timeoutError={timeoutError}
          />
        )}
        {step === 'error' && (
          <RegisterError
            team={team}
            details={registerDetails}
            nextStep={() => navigate(appPath.team(teamId))}
          />
        )}
      </Box>
    </BasePage>
  );
}