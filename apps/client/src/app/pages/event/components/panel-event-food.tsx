import { Box, Button, Text } from 'grommet';
import { omit } from 'lodash';
import React, { useMemo, useState } from 'react';

import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import {
  EventFragmentFragment,
  PricelistItemFragmentFragment,
  RegisteredTeamFragmentFragment,
} from '../../../_generated/graphql';
import { PricelistItemList } from '../../../components/pricelist-item-list';
import { handleExportFoodOrders } from './handle-export-food-orders';

interface PanelEventFoodProps {
  event: EventFragmentFragment;
  registrations: RegisteredTeamFragmentFragment[];
  onChange?: () => void;
  canEdit?: boolean;
}

export function PanelEventFood(props: PanelEventFoodProps) {
  const { event, canEdit, registrations: regs } = props;
  const { notify } = useNotification();

  const eventFoodItems: PricelistItemFragmentFragment[] = useMemo(() => {
    if (!event) return [];
    return event.foodTypes;
  }, [event]);

  if (!event) {
    return null;
  }

  return (
    <Panel title="Stravovanie" gap="medium">
      {eventFoodItems.length === 0 && (
        <>
          <Text>Tento turnaj nemá definované žiadne stravovanie.</Text>
        </>
      )}
      {eventFoodItems.length > 0 && <PricelistItemList items={eventFoodItems} editable={canEdit} />}
      {canEdit && (
        <Box direction="row" gap="small">
          <Button
            label="Export objednávok stravovania"
            onClick={() =>
              handleExportFoodOrders(event?.program.name ?? '', event.name, regs ?? [])
            }
          />
        </Box>
      )}
    </Panel>
  );
}
