import { toUtcDateString } from '@teams2/dateutils';
import React, { useCallback } from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { LabelValue } from '../../../components/label-value';
import { useNotification } from '../../../components/notifications/notification-provider';
import {
  Registration,
  useRegistrationClearShippedMutation,
  useRegistrationSetShippedMutation,
} from '../../../_generated/graphql';
import { SetClearDate } from './set-clear-date';

export const FieldShippedOn = (props: {
  registration: Pick<Registration, 'id' | 'shippedOn'>;
  readOnly: boolean;
}) => {
  const { registration, readOnly } = props;
  const { isAdmin } = useAppUser();
  const { notify } = useNotification();
  const onError = useCallback(
    () => notify.error('Nepodarilo sa aktualizovať registráciu.'),
    [notify],
  );

  const [setShipped] = useRegistrationSetShippedMutation({ onError });
  const [clearShipped] = useRegistrationClearShippedMutation({ onError });

  return (
    <LabelValue label="Materiály odoslané">
      <SetClearDate
        canEdit={isAdmin() && !readOnly}
        date={registration.shippedOn}
        onClear={() => clearShipped({ variables: { id: registration.id } })}
        onSet={() =>
          setShipped({
            variables: { id: registration.id, date: toUtcDateString(new Date()) ?? '' },
          })
        }
      />
    </LabelValue>
  );
};
