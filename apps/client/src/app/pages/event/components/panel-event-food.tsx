import { Box, Button, Text, CheckBox } from 'grommet';
import React from 'react';

import { Panel } from '../../../components/panel';
import {
  EventFragmentFragment,
  PricelistItemInput,
  RegisteredTeamFragmentFragment,
} from '../../../_generated/graphql';
import { PricelistItemList } from '../../../components/pricelist-item-list';
import { handleExportFoodOrders } from './handle-export-food-orders';
import { LabelValue } from '../../../components/label-value';
import { formatDate } from '@teams2/dateutils';
import { EditPricelistItemDialog } from '../../../components/dialogs/edit-pricelist-item-dialog';
import { EditDateDialog } from '../../../components/dialogs/edit-date-dialog';

interface PanelEventFoodProps {
  event: EventFragmentFragment;
  registrations: RegisteredTeamFragmentFragment[];
  onChange?: () => void;
  canEdit?: boolean;
  onIssueInvoices: () => void;
  onModifyDeadline?: (deadline: Date) => void;
  onAddItem?: () => void;
  onModifyItem?: (item: PricelistItemInput) => void;
  onRemoveItem?: (item: PricelistItemInput) => void;
  onEnableFoodOrders: () => void;
  onDisableFoodOrders: () => void;
}

export function PanelEventFood(props: PanelEventFoodProps) {
  const { event, canEdit, registrations: regs } = props;
  const [showModifyItemDialog, setShowModifyItemDialog] = React.useState<PricelistItemInput | null>(
    null,
  );
  const [showModifyDeadlineDialog, setShowModifyDeadlineDialog] = React.useState(false);

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
      <LabelValue label="Objednávanie stravovanie povolené" labelWidth="350px" direction="row">
        <CheckBox
          toggle
          checked={!!event.foodOrderEnabled}
          onClick={event.foodOrderEnabled ? props.onDisableFoodOrders : props.onEnableFoodOrders}
        />
      </LabelValue>
      <LabelValue
        label="Termín pre objednávky stravovania"
        value={event.foodOrderDeadline ? formatDate(event.foodOrderDeadline) : 'neurčený'}
        direction="row"
        labelWidth="350px"
      />
      {eventFoodOrders.length === 0 && (
        <>
          <Text>Tento turnaj nemá definované žiadne stravovanie.</Text>
          {canEdit && (
            <Box direction="row">
              <Button
                label="Pridať"
                onClick={() => props.onAddItem?.()}
                disabled={!props.onAddItem}
              />
            </Box>
          )}
        </>
      )}
      {eventFoodOrders.length > 0 && (
        <>
          <PricelistItemList
            items={eventFoodOrders}
            editable={canEdit}
            onClick={(i) => setShowModifyItemDialog(i)}
            onRemove={(i) => props.onRemoveItem?.(i)}
          />
          {canEdit && (
            <Box direction="row">
              <Button
                label="Pridať položku"
                onClick={() => props.onAddItem?.()}
                disabled={!props.onAddItem}
              />
            </Box>
          )}
        </>
      )}
      {canEdit && (
        <Box direction="row" gap="small">
          <Button
            label="Upraviť termín"
            onClick={() => setShowModifyDeadlineDialog(true)}
            disabled={!props.onModifyDeadline}
          />

          <Button
            label="Export objednávok stravovania"
            onClick={() =>
              handleExportFoodOrders(event?.program.name ?? '', event.name, regs ?? [])
            }
          />
          <Button label="Vystaviť faktúry za stravovanie" onClick={() => props.onIssueInvoices()} />
        </Box>
      )}
      {showModifyItemDialog && (
        <EditPricelistItemDialog
          show={!!showModifyItemDialog}
          item={showModifyItemDialog}
          onClose={() => setShowModifyItemDialog(null)}
          onSubmit={(item) => {
            props.onModifyItem?.(item);
            setShowModifyItemDialog(null);
          }}
          // disable={{
          //   price: (() => {
          //     // check if item is used in any order
          //     const q = eventFoodOrders.find((i) => i.id === showModifyItemDialog.id)?.qty ?? 0;
          //     return q > 0;
          //   })(),
          // }}
        />
      )}
      {showModifyDeadlineDialog && (
        <EditDateDialog
          show={showModifyDeadlineDialog}
          date={event.foodOrderDeadline}
          onClose={() => setShowModifyDeadlineDialog(false)}
          onSubmit={({ date }) => {
            props.onModifyDeadline?.(new Date(date));
            setShowModifyDeadlineDialog(false);
          }}
        />
      )}
    </Panel>
  );
}
