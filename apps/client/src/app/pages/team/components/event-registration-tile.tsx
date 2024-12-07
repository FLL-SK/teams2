import { Anchor, Box, Button, Paragraph, Text } from 'grommet';
import {
  OrderInput,
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
import { useCallback, useMemo, useState } from 'react';
import { emptyOrder, FoodOrderModal } from '../../../components/food-order-modal';
import { useNotification } from '../../../components/notifications/notification-provider';

interface EventRegistrationTileProps {
  registration: TeamRegistrationFragmentFragment;
}

interface Address {
  name: string;
  street: string;
  city: string;
  zip: string;
  companyNumber?: string | null;
  vatNumber?: string | null;
  taxNumber?: string | null;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
}

export function EventRegistrationTile(props: EventRegistrationTileProps) {
  const { registration } = props;
  const { isAdmin, isEventManager } = useAppUser();
  const [showFoodOrderModal, setShowFoodOrderModal] = useState(false);

  const { notify } = useNotification();
  const [updateOrder] = useUpdateRegistrationFoodOrderMutation({
    onError: (e) => notify.error('Nepodarilo sa upraviť objednávku jedla.', e.message),
  });

  if (!registration.event) {
    return null;
  }

  const canOrderFood = useMemo(() => {
    if (registration.canceledOn || !registration.confirmedOn || !registration.event) {
      return false;
    }
    const diff = new Date(registration.event.date ?? 0).getTime() - Date.now();
    const max = 1000 * 60 * 60 * 24 * 7; // 7 days

    return diff > max;
  }, [registration]);

  const handleOrder = useCallback(
    (data: {
      note?: string | null;
      items: { productId: string; name: string; quantity: number }[];
      billTo: Address;
      shipTo?: Address | null;
    }) => {
      const o: OrderInput = {
        note: data.note,
        items: data.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: 0,
          price: 0,
        })),
        billTo: { ...data.billTo },
      };
      if (data.shipTo) {
        o.shipTo = { ...data.shipTo };
      }

      updateOrder({
        variables: {
          id: registration.id,
          order: o,
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
        <LabelValue label="Stravovanie" direction="row">
          <Box direction="row" gap="small">
            <Button
              size="small"
              label={
                registration.foodOrder && registration.foodOrder.items.length > 0
                  ? 'Upraviť'
                  : 'Objednať'
              }
              onClick={() => setShowFoodOrderModal(true)}
              disabled={!canOrderFood && !isAdmin() && !isEventManager(registration.event.id)}
            />
          </Box>
        </LabelValue>
        {!registration.confirmedOn && (
          <Text color="status-warning">
            Stravovanie je možné objedať až po potvrdní registrácie.
          </Text>
        )}
      </LabelValueGroup>

      {showFoodOrderModal && (
        <FoodOrderModal
          availableItems={registration.event.foodTypes ?? []}
          order={registration.foodOrder ?? { ...emptyOrder, billTo: { ...registration.billTo } }}
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
