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
  UpdateTeamInput,
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
import { RegisterConfirmBillToContact } from './components/register-confirm-billto-contact';
import { formatFullName } from '../../utils/format-fullname';
import { handleMutationErrors } from '../../utils/handle_mutation_error';

type RegistrationStep =
  | 'intro'
  | 'confirm-billto-contact'
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
  const { isAdmin, isTeamCoach, user } = useAppUser();
  const [step, setStep] = useState<RegistrationStep>('intro');
  const [registerDetails, setRegisterDetails] = useState<RegisterDetails>({});

  const {
    data: teamData,
    loading: teamLoading,
    error: teamError,
  } = useGetTeamQuery({
    variables: { id: teamId ?? '0' },
    onCompleted: (data) => {
      const coachData: Pick<Address, 'contactName' | 'email' | 'phone'> = {
        contactName: formatFullName(user?.firstName ?? '', user?.lastName ?? ''),
        email: user?.username,
        phone: user?.phone,
      };
      setRegisterDetails({
        ...registerDetails,
        billTo: data.getTeam.billTo
          ? { ...(omitBy(data.getTeam.billTo, isNil) as Address), ...(coachData as Address) }
          : { ...(coachData as Address) }, // remove null/undefined values
        shipTo: data.getTeam.shipTo
          ? { ...(omitBy(data.getTeam.shipTo, isNil) as Address), ...(coachData as Address) }
          : { ...(coachData as Address) }, // remove null/undefined values
      });
    },
  });

  const { notify } = useNotification();

  const [updateTeam] = useUpdateTeamMutation({
    onError: (e) => notify.error('Nepodarilo sa aktualizovať tím. ', e.message),
  });
  const [registerTeam] = useRegisterTeamForEventMutation({
    onError: (e) => notify.error('Nepodarilo sa registrovať tím.', e.message),
  });

  const canRegister = isAdmin() || isTeamCoach(teamId);
  const team = teamData?.getTeam;

  const cancel = useCallback(() => navigate(appPath.team(teamId)), [navigate, teamId]);

  const doRegister = useCallback(
    async (data: RegisterDetails) => {
      // let's assume everything is filled out properly
      const _teamId = teamId ?? '0';
      const _eventId = data.event?.id ?? '0';

      const r1 = await registerTeam({ variables: { teamId: _teamId, eventId: _eventId } });

      if (
        handleMutationErrors(
          r1.data?.registerTeamForEvent,
          'Nepodarilo sa registrovať tím.',
          notify.error
        )
      ) {
        return;
      }
      setStep('success');
    },
    [notify, registerTeam, teamId]
  );

  if (!canRegister) {
    return <ErrorPage title={`Nemáte oprávnenie na registráciu tímu na turnaj.`} />;
  }

  if (!teamId || teamError) {
    return <ErrorPage title="Tím nenájdený" error={teamError} />;
  }

  return (
    <BasePage title={`Registrácia tímu: ${team?.name}`} loading={teamLoading}>
      <Box>
        {step === 'intro' && (
          <RegisterIntro
            team={team}
            nextStep={() => setStep('confirm-billto-contact')}
            prevStep={cancel}
          />
        )}
        {step === 'confirm-billto-contact' && (
          <RegisterConfirmBillToContact
            details={registerDetails}
            nextStep={() => setStep('select-program')}
            prevStep={() => setStep('intro')}
            cancel={cancel}
          />
        )}
        {step === 'select-program' && (
          <RegisterSelectProgram
            team={team}
            details={registerDetails}
            onSubmit={(p) => setRegisterDetails({ ...registerDetails, program: p })}
            nextStep={() => setStep('select-event')}
            prevStep={() => setStep('confirm-billto-contact')}
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
            onSubmit={async (a) => {
              await updateTeam({ variables: { id: teamId, input: { billTo: { ...a } } } });
              setRegisterDetails({ ...registerDetails, billTo: { ...a } });
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
            onSubmit={async (a, ub) => {
              const u: UpdateTeamInput = { useBillTo: ub };
              if (a) {
                u.shipTo = a;
              }
              if (ub) {
                u.shipTo = registerDetails.billTo;
              }
              await updateTeam({ variables: { id: teamId, input: u } });
              setRegisterDetails({
                ...registerDetails,
                shipTo: a ? { ...a } : undefined,
                useBillTo: ub,
              });
            }}
            nextStep={() => setStep('review')}
            prevStep={() => setStep('billto')}
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
