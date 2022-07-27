import { Box, Button, Text } from 'grommet';
import { omit } from 'lodash';
import React, { useState } from 'react';
import { EditInvoiceItemDialog } from '../../../components/dialogs/edit-invoice-item-dialog';
import { InvoiceItemList } from '../../../components/invoice-item-list';
import { Panel } from '../../../components/panel';
import {
  InvoiceItemFragmentFragment,
  RegistrationFragmentFragment,
  useCreateInvoiceItemMutation,
  useDeleteInvoiceItemMutation,
  useUpdateInvoiceItemMutation,
} from '../../../generated/graphql';

interface PanelRegistrationInvoiceItemsProps {
  registration: RegistrationFragmentFragment;
  invoiceItems: InvoiceItemFragmentFragment[];
  columnWidth: string;
  canEdit?: boolean;
  onRefetch?: () => void;
}

export function PanelRegistrationInvoiceItems(props: PanelRegistrationInvoiceItemsProps) {
  const { invoiceItems, canEdit, onRefetch, registration } = props;

  const [invoiceItemAdd, setInvoiceItemAdd] = useState(false);
  const [invoiceItemEdit, setInvoiceItemEdit] = useState<InvoiceItemFragmentFragment>();

  const [createInvoiceItem] = useCreateInvoiceItemMutation({
    onCompleted: () => onRefetch && onRefetch(),
  });
  const [updateInvoiceItem] = useUpdateInvoiceItemMutation({
    onCompleted: () => onRefetch && onRefetch(),
  });
  const [deleteInvoiceItem] = useDeleteInvoiceItemMutation({
    onCompleted: () => onRefetch && onRefetch(),
  });

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
              variables: {
                type: 'registration',
                refId: registration.id ?? '0',
                item: omit(values, 'id'),
              },
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
