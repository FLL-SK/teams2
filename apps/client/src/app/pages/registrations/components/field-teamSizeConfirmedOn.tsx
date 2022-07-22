import { toUtcDateString } from '@teams2/dateutils';
import React from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { LabelValue } from '../../../components/label-value';
import {
  Registration,
  useRegistrationClearTeamSizeConfirmedMutation,
  useRegistrationSetTeamSizeConfirmedMutation,
} from '../../../generated/graphql';
import { SetClearDate } from './set-clear-date';

export const FieldTeamSizeConfirmedOn = (props: {
  registration: Pick<Registration, 'id' | 'sizeConfirmedOn'>;
}) => {
  const { registration } = props;
  const { isAdmin } = useAppUser();
  const [setSizeConfirmed] = useRegistrationSetTeamSizeConfirmedMutation();
  const [clearSizeConfirmed] = useRegistrationClearTeamSizeConfirmedMutation();
  return (
    <LabelValue label="Veľkosť tímu potvrdená">
      <SetClearDate
        canEdit={isAdmin()}
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
