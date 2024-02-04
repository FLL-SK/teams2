import { Box, Button, Text } from 'grommet';
import { omit } from 'lodash';
import React, { useMemo, useState } from 'react';
import { EditInvoiceItemDialog } from '../../../components/dialogs/edit-invoice-item-dialog';
import { InvoiceItemList } from '../../../components/invoice-item-list';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import {
  EventFragmentFragment,
  InvoiceItemFragmentFragment,
  useCreateInvoiceItemMutation,
  useDeleteInvoiceItemMutation,
  useUpdateInvoiceItemMutation,
} from '../../../_generated/graphql';

interface PanelEventFeesProps {
  event: EventFragmentFragment;
  onChange?: () => void;
  canEdit?: boolean;
  publicOnly: boolean;
}

export function PanelEventFees(props: PanelEventFeesProps) {
  const { event, canEdit, onChange, publicOnly } = props;
  const { notify } = useNotification();

  const [invoiceItemEdit, setInvoiceItemEdit] = useState<InvoiceItemFragmentFragment>();
  const [invoiceItemAdd, setInvoiceItemAdd] = useState<boolean>(false);

  const [createInvoiceItem] = useCreateInvoiceItemMutation({
    onCompleted: onChange,
    onError: (e) => notify.error('Nepodarilo sa vytvoriť položku faktúry.', e.message),
  });
  const [updateInvoiceItem] = useUpdateInvoiceItemMutation({
    onCompleted: onChange,
    onError: (e) => notify.error('Nepodarilo sa aktualizovať položku faktúry.', e.message),
  });
  const [deleteInvoiceItem] = useDeleteInvoiceItemMutation({
    onCompleted: onChange,
    onError: (e) => notify.error('Nepodarilo sa vymazať položku faktúry.', e.message),
  });

  const eventInvoiceItems: InvoiceItemFragmentFragment[] = useMemo(() => {
    if (!event) return [];
    if (publicOnly) {
      return event.invoiceItems.filter((i) => i.public);
    } else {
      return event.invoiceItems;
    }
  }, [event, publicOnly]);

  const programInvoiceItems: InvoiceItemFragmentFragment[] = useMemo(() => {
    if (!event) return [];
    if (publicOnly) {
      return event.program.invoiceItems.filter((i) => i.public);
    } else {
      return event.program.invoiceItems;
    }
  }, [event, publicOnly]);

  if (!event) {
    return null;
  }

  return (
    <Panel title="Poplatky" gap="medium">
      {eventInvoiceItems.length === 0 && (
        <>
          <Text>Tento turnaj preberá poplatky z programu v rámci ktorého je organizovaný.</Text>
          <InvoiceItemList items={programInvoiceItems} editable={false} />
        </>
      )}
      {eventInvoiceItems.length > 0 && (
        <InvoiceItemList
          items={eventInvoiceItems}
          onRemove={(i) => deleteInvoiceItem({ variables: { id: i.id } })}
          onClick={(item) => setInvoiceItemEdit(item)}
          editable={canEdit}
        />
      )}
      <Box direction="row">
        {canEdit && <Button label="Pridať poplatok" onClick={() => setInvoiceItemAdd(true)} />}
      </Box>
      <EditInvoiceItemDialog
        show={!!invoiceItemEdit || invoiceItemAdd}
        item={invoiceItemEdit}
        onClose={() => {
          setInvoiceItemAdd(false);
          setInvoiceItemEdit(undefined);
        }}
        onSubmit={(values) => {
          if (invoiceItemAdd || !values.id) {
            createInvoiceItem({
              variables: { type: 'event', refId: event.id, item: omit(values, 'id') },
            });
          } else {
            updateInvoiceItem({
              variables: { id: values.id, item: values },
            });
          }
        }}
      />
    </Panel>
  );
}
