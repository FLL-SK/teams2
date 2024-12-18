import React from 'react';
import { appPath } from '@teams2/common';
import { Box, Spinner } from 'grommet';
import { useCallback, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppUser } from '../../components/app-user/use-app-user';
import { BasePage } from '../../components/base-page';
import { ErrorPage } from '../../components/error-page';
import {
  AddressInput,
  RegistrationInput,
  UpdateTeamInput,
  useCreateEventRegistrationMutation,
  useCreateProgramRegistrationMutation,
  useGetProgramLazyQuery,
  useGetTeamLazyQuery,
  useUpdateTeamMutation,
} from '../../_generated/graphql';
import { CheckoutBillToAddress } from './components/checkout-billto-address';
import { CheckoutIntro } from './components/checkout-intro';
import { CheckoutReview } from './components/checkout-review';
import { CheckoutSelectEvent } from './components/checkout-select-event';
import { CheckoutSelectProgram } from './components/checkout-select-program';
import { CheckoutShipToAddress } from './components/checkout-shipto-address';
import { CheckoutDetails } from './components/types';
import { CheckoutSuccess } from './components/checkout-success';
import { CheckoutError } from './components/checkout-error';
import { useNotification } from '../../components/notifications/notification-provider';
import { CheckoutConfirmBillToContact } from './components/checkout-confirm-billto-contact';
import { formatFullName } from '../../utils/format-fullname';
import { handleMutationErrors, MutationData } from '../../utils/handle_mutation_error';
import { CheckoutSelectType } from './components/checkout-select-type';

type CheckoutStep =
  | 'intro'
  | 'confirm-billto-contact'
  | 'select-item'
  | 'select-type'
  | 'review'
  | 'billto'
  | 'shipto'
  | 'success'
  | 'error';

export function CheckoutPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [teamId, setTeamId] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { notify } = useNotification();
  const { isAdmin, isTeamCoach, user } = useAppUser();
  const [step, setStep] = useState<CheckoutStep>('intro');
  const [checkoutDetails, setCheckoutDetails] = useState<CheckoutDetails>({
    teamId: 'x',
    type: 'NORMAL',
  });
  const [isRegisteringForEvent, setIsRegisteringForEvent] = useState<boolean>(false);

  const [fetchProgram, { data: programData, loading: programLoading, error: programError }] =
    useGetProgramLazyQuery();

  const [fetchTeam, { data: teamData, loading: teamLoading, error: teamError }] =
    useGetTeamLazyQuery({
      onError: (e) => notify.error('Nepodarilo sa načítať tím.', e.message),
    });

  const [updateTeam] = useUpdateTeamMutation({
    onError: (e) => notify.error('Nepodarilo sa aktualizovať tím. ', e.message),
  });

  const [registerTeam4Event] = useCreateEventRegistrationMutation({
    onError: (e) => notify.error('Nepodarilo sa registrovať tím.', e.message),
  });

  const [registerTeam4Program] = useCreateProgramRegistrationMutation({
    onError: (e) => notify.error('Nepodarilo sa registrovať tím.', e.message),
  });

  const canShop = isAdmin() || isTeamCoach(teamId);
  const team = teamData?.getTeam;

  React.useEffect(() => {
    const tid = searchParams.get('teamId');
    setTeamId(tid);
    setCheckoutDetails({ ...checkoutDetails, teamId: tid ?? 'x' });
    setProgramId(searchParams.get('programId'));
    setEventId(searchParams.get('eventId'));
  }, [searchParams]);

  React.useEffect(() => {
    if (teamId) {
      fetchTeam({
        variables: { id: teamId },
      });
    }
  }, [teamId, fetchTeam, user]);

  React.useEffect(() => {
    if (programId) {
      fetchProgram({
        variables: { id: programId },
      }).then((r) => {
        if (r.data?.getProgram) {
          setCheckoutDetails({ ...checkoutDetails, program: r.data.getProgram });
          setIsRegisteringForEvent(true);
        }
      });
    }
  }, [programId, fetchProgram]);

  const cancel = useCallback(() => navigate(appPath.team(teamId)), [navigate, teamId]);

  const doCheckout = useCallback(
    async (data: CheckoutDetails) => {
      if (!teamId) {
        notify.error('Tím nie je špecifikovaný.');
        return;
      }
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

      let resultData: MutationData;

      if (isRegisteringForEvent && data.event) {
        const r1 = await registerTeam4Event({
          variables: {
            teamId,
            eventId: data.event.id,
            input,
          },
        });
        resultData = r1.data?.createEventRegistration;
      } else if (data.program) {
        const r2 = await registerTeam4Program({
          variables: {
            teamId,
            programId: data.program.id,
            input,
          },
        });
        resultData = r2.data?.createProgramRegistration;
      } else {
        notify.error('Nepodarilo sa registrovať tím. Nebol určený program alebo turnaj.');
        return;
      }

      if (handleMutationErrors(resultData, 'Nepodarilo sa registrovať tím.', notify.error)) {
        return;
      }

      setStep('success');
    },
    [notify, registerTeam4Event, teamId, isRegisteringForEvent],
  );

  if (!canShop) {
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
            <CheckoutIntro
              team={team}
              regType={isRegisteringForEvent ? 'EVENT' : 'PROGRAM'}
              nextStep={() => setStep('confirm-billto-contact')}
              prevStep={cancel}
            />
          )}
          {step === 'confirm-billto-contact' && (
            <CheckoutConfirmBillToContact
              contact={{
                id: user.id,
                name: formatFullName(user.firstName, user.lastName),
                email: user.username,
                phone: user.phone,
              }}
              details={checkoutDetails}
              nextStep={(data) => {
                setStep('select-item');
                setCheckoutDetails(data);
              }}
              prevStep={() => setStep('intro')}
              cancel={cancel}
            />
          )}
          {step === 'select-item' && !isRegisteringForEvent && (
            <CheckoutSelectProgram
              details={checkoutDetails}
              onSubmit={(p) => setCheckoutDetails({ ...checkoutDetails, program: p })}
              nextStep={() => setStep('select-type')}
              prevStep={() => setStep('confirm-billto-contact')}
              cancel={cancel}
            />
          )}
          {step === 'select-item' && isRegisteringForEvent && (
            <CheckoutSelectEvent
              details={checkoutDetails}
              onSubmit={(e) => setCheckoutDetails({ ...checkoutDetails, event: e })}
              nextStep={() => setStep('billto')}
              prevStep={() => setStep('confirm-billto-contact')}
              cancel={cancel}
            />
          )}

          {step === 'select-type' && (
            <CheckoutSelectType
              details={checkoutDetails}
              onSubmit={setCheckoutDetails}
              nextStep={() => setStep('billto')}
              prevStep={() => setStep('select-item')}
              cancel={cancel}
            />
          )}
          {step === 'billto' && (
            <CheckoutBillToAddress
              address={checkoutDetails.billTo ?? team.billTo}
              onSubmit={async (a) => {
                const aa: AddressInput = {
                  ...a,
                  contactName: checkoutDetails.billToContact?.name ?? '',
                  email: checkoutDetails.billToContact?.email ?? '',
                  phone: checkoutDetails.billToContact?.phone ?? '',
                };
                await updateTeam({ variables: { id: teamId, input: { billTo: aa } } });
                setCheckoutDetails({ ...checkoutDetails, billTo: aa });
              }}
              nextStep={() => setStep('shipto')}
              prevStep={() => setStep(isRegisteringForEvent ? 'select-item' : 'select-type')}
              cancel={cancel}
            />
          )}
          {step === 'shipto' && (
            <CheckoutShipToAddress
              details={checkoutDetails}
              onSubmit={async (a, ub) => {
                const u: UpdateTeamInput = { useBillTo: ub };
                if (a) {
                  u.shipTo = a;
                }
                if (ub) {
                  u.shipTo = checkoutDetails.billTo;
                }
                await updateTeam({ variables: { id: teamId, input: u } });
                setCheckoutDetails({
                  ...checkoutDetails,
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
            <CheckoutReview
              team={team}
              details={checkoutDetails}
              prevStep={() => setStep('shipto')}
              nextStep={() => doCheckout(checkoutDetails)}
              cancel={cancel}
            />
          )}
          {step === 'success' && (
            <CheckoutSuccess
              team={team}
              details={checkoutDetails}
              nextStep={() => navigate(appPath.team(teamId))}
            />
          )}
          {step === 'error' && (
            <CheckoutError
              team={team}
              details={checkoutDetails}
              nextStep={() => navigate(appPath.team(teamId))}
            />
          )}
        </Box>
      )}
    </BasePage>
  );
}
