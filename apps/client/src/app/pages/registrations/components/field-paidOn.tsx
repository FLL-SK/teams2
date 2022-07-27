import { toUtcDateString } from '@teams2/dateutils';
import React from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { LabelValue } from '../../../components/label-value';
import {
  Registration,
  useRegistrationClearPaidMutation,
  useRegistrationSetPaidMutation,
} from '../../../generated/graphql';
import { SetClearDate } from './set-clear-date';

export const FieldPaidOn = (props: {
  registration: Pick<Registration, 'id' | 'paidOn'>;
  readOnly: boolean;
}) => {
  const { registration, readOnly } = props;
  const { isAdmin } = useAppUser();
  const [setPaid] = useRegistrationSetPaidMutation();
  const [clearPaid] = useRegistrationClearPaidMutation();
  return (
    <LabelValue label="Zaplatená">
      <SetClearDate
        canEdit={isAdmin() && !readOnly}
        date={registration.paidOn}
        onClear={() => clearPaid({ variables: { id: registration.id } })}
        onSet={() =>
          setPaid({
            variables: { id: registration.id, date: toUtcDateString(new Date()) ?? '' },
          })
        }
      />
    </LabelValue>
  );
};
