import { Box, Button, Text } from 'grommet';
import { omit } from 'lodash';
import React, { useMemo, useState } from 'react';
import { EditInvoiceItemDialog } from '../../../components/dialogs/edit-invoice-item-dialog';
import { InvoiceItemList } from '../../../components/invoice-item-list';
import { useNotification } from '../../../components/notifications/notification-provider';
import { Panel } from '../../../components/panel';
import {
  InvoiceItemFragmentFragment,
  ProgramFragmentFragment,
  useCreateInvoiceItemMutation,
  useDeleteInvoiceItemMutation,
  useUpdateInvoiceItemMutation,
} from '../../../generated/graphql';

interface PanelProgramFeesProps {
  program: ProgramFragmentFragment;
  canEdit: boolean;
  onUpdate: () => void;
  publicOnly: boolean;
}

export function PanelProgramFees(props: PanelProgramFeesProps) {
  const { program, canEdit, onUpdate, publicOnly } = props;
  const { notify } = useNotification();

  const [invoiceItemEdit, setInvoiceItemEdit] = useState<InvoiceItemFragmentFragment>();
  const [invoiceItemAdd, setInvoiceItemAdd] = useState<boolean>(false);

  const [createInvoiceItem] = useCreateInvoiceItemMutation({
    onCompleted: onUpdate,
    onError: (e) => notify.error('Nepodarilo sa vytvoriť položku faktúry.', e.message),
  });
  const [updateInvoiceItem] = useUpdateInvoiceItemMutation({
    onCompleted: onUpdate,
    onError: (e) => notify.error('Nepodarilo sa aktualizovať položku faktúry.', e.message),
  });
  const [deleteInvoiceItem] = useDeleteInvoiceItemMutation({
    onCompleted: onUpdate,
    onError: (e) => notify.error('Nepodarilo sa vymazať položku faktúry.', e.message),
  });

  const invoiceItems = useMemo(
    () => (!publicOnly ? program.invoiceItems : program.invoiceItems.filter((i) => i.public)),
    [program.invoiceItems, publicOnly],
  );

  if (!program) {
    return null;
  }

  return (
    <Panel title="Poplatky" gap="medium">
      {invoiceItems.length === 0 && <Text>Tento program je organizovaný bezplatne.</Text>}
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
          if (invoiceItemAdd || !values.id) {
            createInvoiceItem({
              variables: { type: 'program', refId: program.id, item: omit(values, 'id') },
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
