import { Box, Button, Text } from 'grommet';
import React from 'react';

import { Panel } from '../../../components/panel';
import { EventFragmentFragment, RegisteredTeamFragmentFragment } from '../../../_generated/graphql';
import { PricelistItemList } from '../../../components/pricelist-item-list';
import { handleExportFoodOrders } from './handle-export-food-orders';

interface PanelEventFoodProps {
  event: EventFragmentFragment;
  registrations: RegisteredTeamFragmentFragment[];
  onChange?: () => void;
  canEdit?: boolean;
  onIssueInvoices: () => void;
}

export function PanelEventFood(props: PanelEventFoodProps) {
  const { event, canEdit, registrations: regs } = props;

  const eventFoodOrders = React.useMemo(() => {
    const items = event.foodTypes.map((ft) => ({ id: ft.id, n: ft.n, up: ft.up, qty: 0 }));
    for (const r of regs ?? []) {
      if (r.foodOrder) {
        for (const i of r.foodOrder.items) {
          const item = items.find((it) => it.id === i.productId);
          if (item) {
            item.qty += i.quantity;
          } else {
            items.push({ id: i.id, n: i.name, qty: i.quantity, up: i.unitPrice });
          }
        }
      }
    }
    return items;
  }, [event, regs]);

  if (!event) {
    return null;
  }

  return (
    <Panel title="Stravovanie" gap="medium">
      {eventFoodOrders.length === 0 && (
        <>
          <Text>Tento turnaj nemá definované žiadne stravovanie.</Text>
        </>
      )}
      {eventFoodOrders.length > 0 && (
        <PricelistItemList items={eventFoodOrders} editable={canEdit} />
      )}
      {canEdit && (
        <Box direction="row" gap="small">
          <Button
            label="Export objednávok stravovania"
            onClick={() =>
              handleExportFoodOrders(event?.program.name ?? '', event.name, regs ?? [])
            }
          />
          <Button label="Vystaviť faktúry za stravovanie" onClick={() => props.onIssueInvoices()} />
        </Box>
      )}
    </Panel>
  );
}
