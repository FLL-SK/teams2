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
  canEdit?: boolean;
  showInactive?: boolean;
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
  const { registration, canEdit } = props;
  const { isAdmin, isEventManager } = useAppUser();
  const [showFoodOrderModal, setShowFoodOrderModal] = useState(false);
  const [today] = useState(new Date().toISOString().substring(0, 10));

  const { notify } = useNotification();
  const [updateOrder] = useUpdateRegistrationFoodOrderMutation({
    onError: (e) => notify.error('Nepodarilo sa upraviť objednávku jedla.', e.message),
  });

  if (!registration.event) {
    return null;
  }

  const canOrderFood = useMemo(() => {
    console.log('registration', canEdit, today, registration);
    if (
      registration.canceledOn ||
      !registration.confirmedOn ||
      !registration.event ||
      !canEdit ||
      (registration.event.foodOrderDeadline && registration.event.foodOrderDeadline < today) ||
      !registration.event.foodOrderEnabled
    ) {
      return false;
    }
  }, [registration]);

  const handleOrder = useCallback(
    (data: {
      note?: string | null;
      items: { productId: string; name: string; quantity: number; unitPrice: number }[];
      billTo: Address;
      shipTo?: Address | null;
    }) => {
      const o: OrderInput = {
        note: data.note,
        items: data.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          price: item.quantity * item.unitPrice,
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
    <Box>
      <Box background={'light-2'} pad="small">
        <LabelValueGroup direction="row" labelWidth="350px">
          <LabelValue label="Turnaj">
            <Anchor label={registration.event.name} href={appPath.event(registration.event.id)} />
          </LabelValue>

          <LabelValue label="Stav registrácie">
            <Text>{registration.confirmedOn ? 'Potvrdená' : 'Nepotvrdená'}</Text>
            <Anchor label={'Otvor detail'} href={appPath.registration(registration.id)} />
          </LabelValue>

          <LabelValue label="Dátum turnaja">
            <Text>
              {registration.event.date ? formatDate(registration.event.date) : 'dátum neurčený'}
            </Text>
          </LabelValue>

          <FieldTeamSize registration={registration} readOnly={!canEdit} direction="row" />
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
            readOnly={!canEdit}
            direction="row"
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
                disabled={!canOrderFood && !(isAdmin() || isEventManager(registration.event.id))}
              />
            </Box>
            {!registration.confirmedOn && (
              <Text color="status-warning">
                Stravovanie je možné objedať až po potvrdní registrácie.
              </Text>
            )}
          </LabelValue>
        </LabelValueGroup>
      </Box>

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
    </Box>
  );
}
