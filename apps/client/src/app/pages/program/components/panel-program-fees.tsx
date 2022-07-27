import { Box, Button, Text } from 'grommet';
import { omit } from 'lodash';
import React, { useState } from 'react';
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
  program?: ProgramFragmentFragment;
  canEdit: boolean;
  onUpdate: () => void;
}

export function PanelProgramFees(props: PanelProgramFeesProps) {
  const { program, canEdit, onUpdate } = props;
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

  if (!program) {
    return null;
  }

  return (
    <Panel title="Poplatky" gap="medium">
      {program.invoiceItems.length === 0 && <Text>Tento program je organizovaný bezplatne.</Text>}
      {program.invoiceItems.length > 0 && (
        <InvoiceItemList
          items={program.invoiceItems}
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
              variables: { type: 'program', refId: program.id, item: omit(values, 'id') },
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
