import { toUtcDateString } from '@teams2/dateutils';
import React from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { LabelValue } from '../../../components/label-value';
import {
  Registration,
  useRegistrationClearShippedMutation,
  useRegistrationSetShippedMutation,
} from '../../../generated/graphql';
import { SetClearDate } from './set-clear-date';

export const FieldShippedOn = (props: {
  registration: Pick<Registration, 'id' | 'shippedOn'>;
  readOnly: boolean;
}) => {
  const { registration, readOnly } = props;
  const { isAdmin } = useAppUser();
  const [setShipped] = useRegistrationSetShippedMutation();
  const [clearShipped] = useRegistrationClearShippedMutation();
  return (
    <LabelValue label="Odoslaná">
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
