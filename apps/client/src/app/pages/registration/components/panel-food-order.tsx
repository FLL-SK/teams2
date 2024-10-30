import { Text } from 'grommet';
import { InvoiceItemList } from '../../../components/invoice-item-list';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import { RegistrationFragmentFragment } from '../../../_generated/graphql';
import { OrderItemList } from '../../../components/order-item-list';

interface PanelRegistrationFoodOrderProps {
  foodOrder: RegistrationFragmentFragment['foodOrder'];
  columnWidth: string;
  canEdit?: boolean;
  onRefetch?: () => void;
  readOnly: boolean;
}

export function PanelRegistrationFoodOrder(props: PanelRegistrationFoodOrderProps) {
  const { foodOrder, canEdit, onRefetch, readOnly: readonly } = props;

  const { notify } = useNotification();

  return (
    <Panel title="Stravovanie" gap="medium">
      {!foodOrder && <Text>Táto registrácie nemá žiadne stravovanie. </Text>}
      {foodOrder && <OrderItemList order={foodOrder} editable={canEdit && !readonly} />}
    </Panel>
  );
}
