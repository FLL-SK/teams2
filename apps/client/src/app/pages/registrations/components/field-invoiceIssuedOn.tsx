import { toUtcDateString } from '@teams2/dateutils';
import React from 'react';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { LabelValue } from '../../../components/label-value';
import { useNotification } from '../../../components/notifications/notification-provider';
import {
  Registration,
  useRegistrationClearInvoicedMutation,
  useRegistrationSetInvoicedMutation,
} from '../../../_generated/graphql';
import { SetClearDate } from './set-clear-date';
import { appPath } from '@teams2/common';

export const FieldInvoiceIssuedOn = (props: {
  registration: Pick<Registration, 'id' | 'invoiceIssuedOn' | 'invoiceRef'>;
  readOnly: boolean;
}) => {
  const { registration, readOnly } = props;
  const { isAdmin } = useAppUser();
  const { notify } = useNotification();

  const onError = () => notify.error('Nepodarilo sa aktualizovať dátum vystavenia faktúry.');
  const [setInvoiced] = useRegistrationSetInvoicedMutation({ onError });
  const [clearInvoiced] = useRegistrationClearInvoicedMutation({ onError });
  return (
    <LabelValue label="Faktúra vystavená">
      <SetClearDate
        canEdit={isAdmin() && !readOnly}
        clearType="button"
        date={registration.invoiceIssuedOn}
        onClear={() => clearInvoiced({ variables: { id: registration.id } })}
        onSet={() =>
          setInvoiced({
            variables: { id: registration.id, date: toUtcDateString(new Date()) ?? '' },
          })
        }
        action={{
          hide: !registration.invoiceRef,
          label: 'Otvoriť',
          onClick: () =>
            registration.invoiceRef &&
            window.open(appPath.sfShowInvoice(registration.invoiceRef), '_blank'),
        }}
      />
    </LabelValue>
  );
};
