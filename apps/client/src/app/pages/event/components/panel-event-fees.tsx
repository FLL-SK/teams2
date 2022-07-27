import { Box, Button, Text } from 'grommet';
import { omit } from 'lodash';
import React, { useState } from 'react';
import { EditInvoiceItemDialog } from '../../../components/dialogs/edit-invoice-item-dialog';
import { InvoiceItemList } from '../../../components/invoice-item-list';
import { Panel } from '../../../components/panel';
import {
  EventFragmentFragment,
  InvoiceItemFragmentFragment,
  useCreateInvoiceItemMutation,
  useDeleteInvoiceItemMutation,
  useUpdateInvoiceItemMutation,
} from '../../../generated/graphql';

interface PanelEventFeesProps {
  event?: EventFragmentFragment | null;
  onChange?: () => void;
  canEdit?: boolean;
}

export function PanelEventFees(props: PanelEventFeesProps) {
  const { event, canEdit, onChange } = props;

  const [invoiceItemEdit, setInvoiceItemEdit] = useState<InvoiceItemFragmentFragment>();
  const [invoiceItemAdd, setInvoiceItemAdd] = useState<boolean>(false);

  const [createInvoiceItem] = useCreateInvoiceItemMutation({ onCompleted: onChange });
  const [updateInvoiceItem] = useUpdateInvoiceItemMutation({ onCompleted: onChange });
  const [deleteInvoiceItem] = useDeleteInvoiceItemMutation({ onCompleted: onChange });

  if (!event) {
    return null;
  }

  const invoiceItems = event?.invoiceItems ?? [];

  return (
    <Panel title="Poplatky" gap="medium">
      {invoiceItems.length === 0 && (
        <Text>
          Tento turnaj preberá poplatky z programu v rámci ktorého je organizovaný. Pridaním
          poplatku je možné definovať poplatky špecifické pre tento turnaj.
        </Text>
      )}
      {invoiceItems.length > 0 && (
        <InvoiceItemList
          items={invoiceItems}
          onRemove={(i) => deleteInvoiceItem({ variables: { id: i.id } })}
          onClick={(item) => setInvoiceItemEdit(item)}
          editable={canEdit}
        />
      )}
      <Box direction="row">
        <Button
          label="Pridať poplatok"
          onClick={() => setInvoiceItemAdd(true)}
          disabled={!canEdit}
        />
      </Box>
      <EditInvoiceItemDialog
        show={!!invoiceItemEdit || invoiceItemAdd}
        item={invoiceItemEdit}
        onClose={() => {
          setInvoiceItemAdd(false);
          setInvoiceItemEdit(undefined);
        }}
        onSubmit={(values) => {
          if (invoiceItemAdd) {
            createInvoiceItem({
              variables: { type: 'event', refId: event.id ?? '0', item: omit(values, 'id') },
            });
          } else {
            updateInvoiceItem({
              variables: { id: values.id ?? '0', item: values },
            });
          }
        }}
      />
    </Panel>
  );
}
