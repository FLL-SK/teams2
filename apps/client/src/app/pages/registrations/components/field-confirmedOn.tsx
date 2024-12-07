import { toUtcDateString } from '@teams2/dateutils';
import React from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { LabelValue } from '../../../components/label-value';
import { useNotification } from '../../../components/notifications/notification-provider';
import {
  Registration,
  useRegistrationClearConfirmedMutation,
  useRegistrationSetConfirmedMutation,
} from '../../../_generated/graphql';
import { SetClearDate } from './set-clear-date';

export const FieldConfirmedOn = (props: {
  registration: Pick<Registration, 'id' | 'confirmedOn'>;
  readOnly: boolean;
  tip?: string;
}) => {
  const { registration, readOnly } = props;
  const { isAdmin } = useAppUser();
  const { notify } = useNotification();
  const onError = () => notify.error('Nepodarilo sa aktualizovať dátum potvrdenia registrácie.');
  const [setConfirmed] = useRegistrationSetConfirmedMutation({ onError });
  const [clearConfirmed] = useRegistrationClearConfirmedMutation({ onError });

  return (
    <LabelValue label="Potvrdená" tip={props.tip}>
      <SetClearDate
        canEdit={isAdmin() && !readOnly}
        date={registration.confirmedOn}
        onClear={() => clearConfirmed({ variables: { id: registration.id } })}
        onSet={() =>
          setConfirmed({
            variables: { id: registration.id, date: toUtcDateString(new Date()) ?? '' },
          })
        }
      />
    </LabelValue>
  );
};
