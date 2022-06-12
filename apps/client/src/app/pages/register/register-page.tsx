import { appPath } from '@teams2/common';
import { Box } from 'grommet';
import { useCallback, useState } from 'react';
import { omitBy, isNil } from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import { Address, useGetTeamQuery, useUpdateTeamMutation } from '../../generated/graphql';
import { RegisterBillToAddress } from './components/register-billto-address';
import { RegisterIntro } from './components/register-intro';
import { RegisterReview } from './components/register-review';
import { RegisterSelectEvent } from './components/register-select-event';
import { RegisterSelectProgram } from './components/register-select-program';
import { RegisterShipToAddress } from './components/register-shipto-address';
import { RegisterDetails } from './components/types';

export function RegisterPage() {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isTeamCoach } = useAppUser();
  const [step, setStep] = useState(1);
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

  const canRegister = isAdmin() || isTeamCoach(teamId);
  const team = teamData?.getTeam;

  const cancel = useCallback(() => navigate(appPath.team(teamId)), [navigate, teamId]);

  const doRegister = useCallback(
    (data: RegisterDetails) => {
      console.log('doRegister', data);
      //TODO: register team for event
      // send to server and receive confirmation with invoice number
      // display invoice number
      // let user click OK and return to team page
      navigate(appPath.team(teamId));
    },
    [navigate, teamId]
  );

  if (!teamId || teamError) {
    return <ErrorPage title="Tím nenájdený" error={teamError} />;
  }

  return (
    <BasePage title={`Registrácia tímu ${team?.name} turnaj`} loading={teamLoading}>
      <Box>
        {step === 1 && <RegisterIntro team={team} nextStep={() => setStep(2)} prevStep={cancel} />}
        {step === 2 && (
          <RegisterSelectProgram
            team={team}
            details={registerDetails}
            onSubmit={(p) => setRegisterDetails({ ...registerDetails, program: p })}
            nextStep={() => setStep(3)}
            prevStep={() => setStep(1)}
            cancel={cancel}
          />
        )}
        {step === 3 && (
          <RegisterSelectEvent
            team={team}
            details={registerDetails}
            onSubmit={(e) => setRegisterDetails({ ...registerDetails, event: e })}
            nextStep={() => setStep(4)}
            prevStep={() => setStep(2)}
            cancel={cancel}
          />
        )}
        {step === 4 && (
          <RegisterBillToAddress
            team={team}
            details={registerDetails}
            onSubmit={(a) => {
              updateTeam({ variables: { id: teamId, input: { billTo: a } } });
              setRegisterDetails({ ...registerDetails, billTo: a });
            }}
            nextStep={() => setStep(5)}
            prevStep={() => setStep(3)}
            cancel={cancel}
          />
        )}
        {step === 5 && (
          <RegisterShipToAddress
            team={team}
            details={registerDetails}
            onSubmit={(a) => {
              updateTeam({ variables: { id: teamId, input: { shipTo: a } } });
              setRegisterDetails({ ...registerDetails, shipTo: a });
            }}
            nextStep={() => setStep(6)}
            prevStep={() => setStep(4)}
            cancel={cancel}
          />
        )}
        {step === 6 && (
          <RegisterReview
            team={team}
            details={registerDetails}
            prevStep={() => setStep(5)}
            nextStep={() => doRegister(registerDetails)}
            cancel={cancel}
          />
        )}
      </Box>
    </BasePage>
  );
}
