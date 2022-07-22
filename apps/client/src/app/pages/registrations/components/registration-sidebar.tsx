import { formatDate, toUtcDateString } from '@teams2/dateutils';
import { Anchor, Box, Spinner, Text } from 'grommet';
import React, { useState } from 'react';
import { EditShipmentGroupDialog } from '../../../components/dialogs/edit-shipment-group-dialog';
import { EditTeamSizeDialog } from '../../../components/dialogs/edit-team-size-dialog';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { NoteList } from '../../../components/note-list';
import { ClosableSidebar } from '../../../components/sidebar';
import { SidebarPanel, SidebarPanelGroup } from '../../../components/sidebar-panel';
import { TagList } from '../../../components/tag-list';
import {
  RegistrationTeamFragmentFragment,
  useAddTagToTeamMutation,
  useCreateNoteMutation,
  useDeleteTagMutation,
  useGetNotesQuery,
  useRegistrationClearInvoicedMutation,
  useRegistrationClearPaidMutation,
  useRegistrationClearShippedMutation,
  useRegistrationClearTeamSizeConfirmedMutation,
  useRegistrationSetInvoicedMutation,
  useRegistrationSetPaidMutation,
  useRegistrationSetShipmentGroupMutation,
  useRegistrationSetShippedMutation,
  useRegistrationSetTeamSizeConfirmedMutation,
  useRegistrationSetTeamSizeMutation,
} from '../../../generated/graphql';
import { fullAddress } from '../../../utils/format-address';
import { SetClearDate } from './set-clear-date';

interface RegistrationSidebarProps {
  registration?: RegistrationTeamFragmentFragment;
  onClose: () => unknown;
  onChanged: () => unknown;
}

export function RegistrationSidebar(props: RegistrationSidebarProps) {
  const { registration, onClose, onChanged } = props;

  console.log(registration);

  const [showEditShipmentGroupDialog, setShowEditShipmentGroupDialog] = useState(false);
  const [showEditTeamSizeDialog, setShowEditTeamSizeDialog] = useState(false);

  const {
    data: notesData,
    loading: notesLoading,
    refetch: notesRefetch,
  } = useGetNotesQuery({
    variables: { type: 'registration', ref: registration?.id ?? '0' },
  });

  const [removeTag] = useDeleteTagMutation();
  const [addTag] = useAddTagToTeamMutation();
  const [createNote] = useCreateNoteMutation({ onCompleted: () => onChanged() });

  const [setInvoiced] = useRegistrationSetInvoicedMutation();
  const [clearInvoiced] = useRegistrationClearInvoicedMutation();
  const [setPaid] = useRegistrationSetPaidMutation();
  const [clearPaid] = useRegistrationClearPaidMutation();
  const [setShipped] = useRegistrationSetShippedMutation({ onCompleted: () => notesRefetch() });
  const [clearShipped] = useRegistrationClearShippedMutation();
  const [setShipmentGroup] = useRegistrationSetShipmentGroupMutation();
  const [setTeamSize] = useRegistrationSetTeamSizeMutation();
  const [setSizeConfirmed] = useRegistrationSetTeamSizeConfirmedMutation();
  const [clearSizeConfirmed] = useRegistrationClearTeamSizeConfirmedMutation();

  if (!registration) {
    return null;
  }
  return (
    <>
      <ClosableSidebar onClose={onClose} show={!!registration} width="350px">
        <SidebarPanelGroup title="Team" gap="medium">
          <SidebarPanel label="Tím">
            <LabelValueGroup direction="column" gap="small">
              <LabelValue label="Názov" value={registration.team.name} />
              <LabelValue label="Zriaďovateľ" value={fullAddress(registration.team.address)} />
            </LabelValueGroup>
          </SidebarPanel>
          <SidebarPanel label="Štítky tímu">
            <TagList
              tags={registration.team.tags}
              onRemove={(id) => removeTag({ variables: { id } })}
              onAdd={(tag) =>
                addTag({ variables: { teamId: registration.team.id, tagId: tag.id } })
              }
            />
          </SidebarPanel>
          <SidebarPanel label="Registrácia">
            <LabelValueGroup direction="column" gap="small">
              <LabelValue label="Registrácia" value={formatDate(registration.registeredOn)} />
              <LabelValue label="Faktúra">
                <SetClearDate
                  date={registration.invoiceIssuedOn}
                  onClear={() => clearInvoiced({ variables: { id: registration.id } })}
                  onSet={() =>
                    setInvoiced({
                      variables: { id: registration.id, date: toUtcDateString(new Date()) ?? '' },
                    })
                  }
                />
              </LabelValue>
              <LabelValue label="Zaplatená">
                <SetClearDate
                  date={registration.paidOn}
                  onClear={() => clearPaid({ variables: { id: registration.id } })}
                  onSet={() =>
                    setPaid({
                      variables: { id: registration.id, date: toUtcDateString(new Date()) ?? '' },
                    })
                  }
                />
              </LabelValue>
              <LabelValue label="Zásielka č.">
                <Box direction="row" width="100%" justify="between">
                  <Text>{registration.shipmentGroup ?? '-'}</Text>
                  {!registration.shippedOn && (
                    <Anchor
                      size="small"
                      label="Nastav"
                      onClick={() => setShowEditShipmentGroupDialog(true)}
                    />
                  )}
                </Box>
              </LabelValue>
              <LabelValue label="Odoslaná">
                <SetClearDate
                  date={registration.shippedOn}
                  onClear={() => clearShipped({ variables: { id: registration.id } })}
                  onSet={() =>
                    setShipped({
                      variables: { id: registration.id, date: toUtcDateString(new Date()) ?? '' },
                    })
                  }
                />
              </LabelValue>
              <LabelValue label="Počet členov">
                <Box direction="row" width="100%" justify="between">
                  <Text>{registration.teamSize ?? '-'}</Text>
                  <Anchor
                    size="small"
                    label="Nastav"
                    onClick={() => setShowEditTeamSizeDialog(true)}
                  />
                </Box>
              </LabelValue>
              <LabelValue label="Počet členov potvrdený">
                <SetClearDate
                  date={registration.sizeConfirmedOn}
                  onClear={() => clearSizeConfirmed({ variables: { id: registration.id } })}
                  onSet={() =>
                    setSizeConfirmed({
                      variables: { id: registration.id, date: toUtcDateString(new Date()) ?? '' },
                    })
                  }
                />
              </LabelValue>
            </LabelValueGroup>
          </SidebarPanel>
          <SidebarPanel label="Poznámky k registrácii">
            {notesLoading ? (
              <Spinner />
            ) : (
              <NoteList
                notes={notesData?.getNotes ?? []}
                limit={3}
                onCreate={(text) =>
                  createNote({
                    variables: { input: { type: 'registration', ref: registration.id, text } },
                  })
                }
              />
            )}
          </SidebarPanel>
        </SidebarPanelGroup>
      </ClosableSidebar>
      <EditShipmentGroupDialog
        show={showEditShipmentGroupDialog}
        group={registration.shipmentGroup}
        onClose={() => setShowEditShipmentGroupDialog(false)}
        onSubmit={(group) => setShipmentGroup({ variables: { id: registration.id, group } })}
      />
      <EditTeamSizeDialog
        show={showEditTeamSizeDialog}
        size={registration.teamSize}
        onClose={() => setShowEditTeamSizeDialog(false)}
        onSubmit={(size) => setTeamSize({ variables: { id: registration.id, size: Number(size) } })}
      />
    </>
  );
}

export default RegistrationSidebar;
