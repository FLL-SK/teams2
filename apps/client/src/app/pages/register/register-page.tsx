import React from 'react';
import { appPath } from '@teams2/common';
import { Box, Spinner } from 'grommet';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import {
  AddressInput,
  RegistrationInput,
  UpdateTeamInput,
  useCreateRegistrationMutation,
  useGetTeamLazyQuery,
  useUpdateTeamMutation,
} from '../../_generated/graphql';
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
import { RegisterSelectType } from './components/register-select-type';

type RegistrationStep =
  | 'intro'
  | 'confirm-billto-contact'
  | 'select-event'
  | 'select-program'
  | 'select-type'
  | 'review'
  | 'billto'
  | 'shipto'
  | 'success'
  | 'error';

export function RegisterPage() {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { isAdmin, isTeamCoach, user } = useAppUser();
  const [step, setStep] = useState<RegistrationStep>('intro');
  const [registerDetails, setRegisterDetails] = useState<RegisterDetails>({ type: 'NORMAL' });

  const [fetchTeam, { data: teamData, loading: teamLoading, error: teamError }] =
    useGetTeamLazyQuery();

  const [updateTeam] = useUpdateTeamMutation({
    onError: (e) => notify.error('Nepodarilo sa aktualizovať tím. ', e.message),
  });

  const [registerTeam] = useCreateRegistrationMutation({
    onError: (e) => notify.error('Nepodarilo sa registrovať tím.', e.message),
  });

  const canRegister = isAdmin() || isTeamCoach(teamId);
  const team = teamData?.getTeam;

  React.useEffect(() => {
    if (teamId) {
      fetchTeam({
        variables: { id: teamId },
      });
    }
  }, [teamId, fetchTeam, user]);

  const cancel = useCallback(() => navigate(appPath.team(teamId)), [navigate, teamId]);

  const doRegister = useCallback(
    async (data: RegisterDetails) => {
      if (teamId && data.event && data.event.id) {
        if (!data.billTo) {
          notify.error('Fakturačná adresa nie je vyplnená.');
          return;
        }
        if (!data.shipTo) {
          notify.error('Doručovacia adresa nie je vyplnená.');
          return;
        }
        const input: RegistrationInput = {
          type: data.type,
          billTo: data.billTo,
          shipTo: data.shipTo,
        };
        if (input.type === 'CLASS_PACK') {
          input.impactedTeamCount = Number(data.teamsImpacted) ?? 1;
          input.impactedChildrenCount = Number(data.childrenImpacted) ?? 1;
          input.setCount = Number(data.setCount) ?? 1;
        }

        const r1 = await registerTeam({
          variables: {
            teamId,
            eventId: data.event.id,
            input,
          },
        });

        if (
          handleMutationErrors(
            r1.data?.createRegistration,
            'Nepodarilo sa registrovať tím.',
            notify.error,
          )
        ) {
          return;
        }
        setStep('success');
      }
    },
    [notify, registerTeam, teamId],
  );

  if (!canRegister) {
    return <ErrorPage title={`Nemáte oprávnenie na registráciu tímu na turnaj.`} />;
  }

  if (!teamId || teamError) {
    return <ErrorPage title="Tím nenájdený" error={teamError} />;
  }

  return (
    <BasePage title={`Registrácia tímu: ${team?.name}`}>
      {teamLoading || !team || !user ? (
        <Spinner />
      ) : (
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
              contact={{
                id: user.id,
                name: formatFullName(user.firstName, user.lastName),
                email: user.username,
                phone: user.phone,
              }}
              details={registerDetails}
              nextStep={(data) => {
                setStep('select-program');
                setRegisterDetails(data);
              }}
              prevStep={() => setStep('intro')}
              cancel={cancel}
            />
          )}
          {step === 'select-program' && (
            <RegisterSelectProgram
              details={registerDetails}
              onSubmit={(p) => setRegisterDetails({ ...registerDetails, program: p })}
              nextStep={() => setStep('select-event')}
              prevStep={() => setStep('confirm-billto-contact')}
              cancel={cancel}
            />
          )}
          {step === 'select-event' && (
            <RegisterSelectEvent
              details={registerDetails}
              onSubmit={(e) => setRegisterDetails({ ...registerDetails, event: e })}
              nextStep={() => setStep('select-type')}
              prevStep={() => setStep('select-program')}
              cancel={cancel}
            />
          )}
          {step === 'select-type' && (
            <RegisterSelectType
              details={registerDetails}
              onSubmit={setRegisterDetails}
              nextStep={() => setStep('billto')}
              prevStep={() => setStep('select-event')}
              cancel={cancel}
            />
          )}
          {step === 'billto' && (
            <RegisterBillToAddress
              address={registerDetails.billTo ?? team.billTo}
              onSubmit={async (a) => {
                const aa: AddressInput = {
                  ...a,
                  contactName: registerDetails.billToContact?.name ?? '',
                  email: registerDetails.billToContact?.email ?? '',
                  phone: registerDetails.billToContact?.phone ?? '',
                };
                await updateTeam({ variables: { id: teamId, input: { billTo: aa } } });
                setRegisterDetails({ ...registerDetails, billTo: aa });
              }}
              nextStep={() => setStep('shipto')}
              prevStep={() => setStep('select-type')}
              cancel={cancel}
            />
          )}
          {step === 'shipto' && (
            <RegisterShipToAddress
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
      )}
    </BasePage>
  );
}
