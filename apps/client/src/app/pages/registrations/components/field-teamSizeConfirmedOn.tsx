import { toUtcDateString } from '@teams2/dateutils';
import React, { useCallback } from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { LabelValue } from '../../../components/label-value';
import { useNotification } from '../../../components/notifications/notification-provider';
import {
  Registration,
  useRegistrationClearTeamSizeConfirmedMutation,
  useRegistrationSetTeamSizeConfirmedMutation,
} from '../../../_generated/graphql';
import { SetClearDate } from './set-clear-date';

export const FieldTeamSizeConfirmedOn = (props: {
  registration: Pick<Registration, 'id' | 'sizeConfirmedOn'>;
  teamId?: string;
  readOnly: boolean;
}) => {
  const { registration, teamId, readOnly } = props;
  const { isAdmin, isTeamCoach } = useAppUser();
  const { notify } = useNotification();
  const onError = useCallback(
    () => notify.error('Nepodarilo sa aktualizovať registráciu.'),
    [notify],
  );

  const [setSizeConfirmed] = useRegistrationSetTeamSizeConfirmedMutation({ onError });
  const [clearSizeConfirmed] = useRegistrationClearTeamSizeConfirmedMutation({ onError });

  return (
    <LabelValue
      label="Veľkosť tímu potvrdená"
      tip="Dátum potvrdenia počtu detí a trénerov, ktorí sa NAOZAJ záčastnia na turnaji."
    >
      <SetClearDate
        canEdit={(isAdmin() || isTeamCoach(teamId)) && !readOnly}
        date={registration.sizeConfirmedOn}
        onClear={() => clearSizeConfirmed({ variables: { id: registration.id } })}
        onSet={() =>
          setSizeConfirmed({
            variables: { id: registration.id, date: toUtcDateString(new Date()) ?? '' },
          })
        }
      />
    </LabelValue>
  );
};
