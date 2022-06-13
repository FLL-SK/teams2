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
  RegisterTeamInput,
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

  const canRegister = isAdmin() || isTeamCoach(teamId);
  const team = teamData?.getTeam;

  const cancel = useCallback(() => navigate(appPath.team(teamId)), [navigate, teamId]);

  const doRegister = useCallback(
    async (data: RegisterDetails) => {
      console.log('doRegister', data);

      const input: Partial<RegisterTeamInput> = {
        eventId: data?.event?.id ?? '0',
        teamId: teamId ?? '0',
      };

      // let's assume everything is filled out properly
      const result = await registerTeam({ variables: { input: input as RegisterTeamInput } });
      if (!result.errors) {
        setStep('success');
      }
    },
    [registerTeam, teamId]
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
          />
        )}
        {step === 'error' && (
          <RegisterSuccess
            team={team}
            details={registerDetails}
            nextStep={() => navigate(appPath.team(teamId))}
          />
        )}
      </Box>
    </BasePage>
  );
}
