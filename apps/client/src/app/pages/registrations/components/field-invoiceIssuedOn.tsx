import { toUtcDateString } from '@teams2/dateutils';
import React from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { LabelValue } from '../../../components/label-value';
import {
  Registration,
  useRegistrationClearInvoicedMutation,
  useRegistrationSetInvoicedMutation,
} from '../../../generated/graphql';
import { SetClearDate } from './set-clear-date';

export const FieldInvoiceIssuedOn = (props: {
  registration: Pick<Registration, 'id' | 'invoiceIssuedOn'>;
}) => {
  const { registration } = props;
  const { isAdmin } = useAppUser();

  const [setInvoiced] = useRegistrationSetInvoicedMutation();
  const [clearInvoiced] = useRegistrationClearInvoicedMutation();
  return (
    <LabelValue label="Faktúra">
      <SetClearDate
        canEdit={isAdmin()}
        date={registration.invoiceIssuedOn}
        onClear={() => clearInvoiced({ variables: { id: registration.id } })}
        onSet={() =>
          setInvoiced({
            variables: { id: registration.id, date: toUtcDateString(new Date()) ?? '' },
          })
        }
      />
    </LabelValue>
  );
};