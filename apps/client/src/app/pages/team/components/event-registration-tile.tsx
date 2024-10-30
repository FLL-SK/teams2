import { Anchor, Button, Paragraph, Text } from 'grommet';
import {
  TeamRegistrationFragmentFragment,
  useUpdateRegistrationFoodOrderMutation,
} from '../../../_generated/graphql';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { FieldTeamSize } from '../../registrations/components/field-teamSize';
import { FieldTeamSizeConfirmedOn } from '../../registrations/components/field-teamSizeConfirmedOn';
import { formatDate } from '@teams2/dateutils';
import { appPath } from '@teams2/common';
import { useAppUser } from '../../../components/app-user/use-app-user';
import { useCallback, useState } from 'react';
import { FoodOrderModal } from './food-order-modal';
import { useNotification } from '../../../components/notifications/notification-provider';

interface EventRegistrationTileProps {
  registration: TeamRegistrationFragmentFragment;
}

export function EventRegistrationTile(props: EventRegistrationTileProps) {
  const { registration } = props;
  const { isAdmin } = useAppUser();
  const [showFoodOrderModal, setShowFoodOrderModal] = useState(false);

  const { notify } = useNotification();
  const [updateOrder] = useUpdateRegistrationFoodOrderMutation({
    onError: (e) => notify.error('Nepodarilo sa upraviť objednávku jedla.', e.message),
  });

  if (!registration.event) {
    return null;
  }

  const handleOrder = useCallback(
    (data: { productId: string; name: string; quantity: number }[]) => {
      updateOrder({
        variables: {
          id: registration.id,
          order: {
            items: data.map((item) => ({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              unitPrice: 0,
              price: 0,
            })),
          },
        },
      });
    },
    [registration],
  );

  return (
    <>
      <LabelValueGroup labelWidth="250px" gap="small" direction="row">
        <LabelValue label="Turnaj">
          <Anchor label={registration.event.name} href={appPath.event(registration.event.id)} />
        </LabelValue>
        <LabelValue label="Registracia na turnaj">
          <Anchor
            label="Otvor detaily registracie na turnaj"
            href={appPath.registration(registration.id)}
          />
        </LabelValue>

        <LabelValue label="Dátum turnaja">
          <Text>{registration.event.date ? formatDate(registration.event.date) : 'neurčený'}</Text>
        </LabelValue>

        <FieldTeamSize registration={registration} readOnly={!!registration.canceledOn} />

        {registration.program.maxTeamSize &&
        registration.girlCount + registration.boyCount > registration.program.maxTeamSize ? (
          <Paragraph color="status-critical">
            Počet detí v tíme je väčší ako dovoľujú pravidlá programu. Maximálna veľkosť tímu je{' '}
            {registration.program.maxTeamSize}. Na turnaji sa môže súťažne zúčastniť iba povolený
            počet detí. Ostatní sa môžu zúčastniť ako diváci.
          </Paragraph>
        ) : null}
        <FieldTeamSizeConfirmedOn
          registration={registration}
          teamId={registration.teamId}
          readOnly={!!registration.canceledOn}
        />
        <LabelValue label="Stravovanie">
          <Button
            label={
              registration.foodOrder && registration.foodOrder.items.length > 0
                ? 'Upraviť'
                : 'Objednať'
            }
            onClick={() => setShowFoodOrderModal(true)}
          />
        </LabelValue>
      </LabelValueGroup>

      {showFoodOrderModal && (
        <FoodOrderModal
          availableItems={registration.event.foodTypes ?? []}
          orderItems={registration.foodOrder?.items ?? []}
          onClose={() => setShowFoodOrderModal(false)}
          onOrder={(data) => {
            setShowFoodOrderModal(false);
            handleOrder(data);
          }}
        />
      )}
    </>
  );
}
