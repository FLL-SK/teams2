import { formatDate, toUtcDateString } from '@teams2/dateutils';
import { Anchor, Box, Spinner, Text } from 'grommet';
import { CoatCheck } from 'grommet-icons';
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
  useAddTagToTeamMutation,
  useCreateNoteMutation,
  useDeleteTagMutation,
  useGetNotesQuery,
  useGetRegistrationQuery,
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
  registrationId?: string;
  onClose: () => unknown;
}

export function RegistrationSidebar(props: RegistrationSidebarProps) {
  const { registrationId, onClose } = props;

  const [showEditShipmentGroupDialog, setShowEditShipmentGroupDialog] = useState(false);
  const [showEditTeamSizeDialog, setShowEditTeamSizeDialog] = useState(false);

  const {
    data: notesData,
    loading: notesLoading,
    refetch: notesRefetch,
  } = useGetNotesQuery({
    variables: { type: 'registration', ref: registrationId ?? '0' },
  });

  const { data: regData, loading: regLoading } = useGetRegistrationQuery({
    variables: { id: registrationId ?? '0' },
  });

  const [removeTag] = useDeleteTagMutation();
  const [addTag] = useAddTagToTeamMutation();
  const [createNote] = useCreateNoteMutation({ onCompleted: () => notesRefetch() });

  const [setInvoiced] = useRegistrationSetInvoicedMutation();
  const [clearInvoiced] = useRegistrationClearInvoicedMutation();
  const [setPaid] = useRegistrationSetPaidMutation();
  const [clearPaid] = useRegistrationClearPaidMutation();
  const [setShipped] = useRegistrationSetShippedMutation();
  const [clearShipped] = useRegistrationClearShippedMutation();
  const [setShipmentGroup] = useRegistrationSetShipmentGroupMutation();
  const [setTeamSize] = useRegistrationSetTeamSizeMutation();
  const [setSizeConfirmed] = useRegistrationSetTeamSizeConfirmedMutation();
  const [clearSizeConfirmed] = useRegistrationClearTeamSizeConfirmedMutation();

  const registration = regData?.getRegistration;

  if (!registration) {
    return null;
  }

  return (
    <>
      <ClosableSidebar
        onClose={onClose}
        show={!!registration}
        width="350px"
        title="Registrácia"
        gap="small"
      >
        <SidebarPanel>
          <LabelValueGroup direction="column" gap="small">
            <LabelValue label="Turnaj" value={registration.event.name} />
            <LabelValue label="Tím" value={registration.team.name} />
          </LabelValueGroup>
        </SidebarPanel>

        <SidebarPanelGroup title="Team" gap="medium">
          <Box overflow={{ vertical: 'auto' }} gap="medium">
            <SidebarPanel>
              <LabelValueGroup direction="column" gap="small">
                <LabelValue
                  label="Zriaďovateľ tímu"
                  value={fullAddress(registration.team.address)}
                />
              </LabelValueGroup>
            </SidebarPanel>
            <SidebarPanel label="Tréneri">
              <LabelValueGroup direction="column" gap="small" labelWidth="250px">
                {registration.team.coaches
                  .filter((coach) => !coach.deletedOn)
                  .map((coach) => (
                    <LabelValue label={coach.name} key={coach.id}>
                      <Text>{coach.username}</Text>
                      <Text>{coach.phone}</Text>
                    </LabelValue>
                  ))}
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
              <LabelValueGroup direction="column" gap="small" labelWidth="250px">
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
                <LabelValue label="Veľkosť tímu">
                  <Box direction="row" width="100%" justify="between">
                    <Text>{registration.teamSize ?? '-'}</Text>
                    <Anchor
                      size="small"
                      label="Nastav"
                      onClick={() => setShowEditTeamSizeDialog(true)}
                    />
                  </Box>
                </LabelValue>
                <LabelValue label="Veľkosť tímu potvrdená">
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
                  limit={10}
                  onCreate={(text) =>
                    createNote({
                      variables: { input: { type: 'registration', ref: registration.id, text } },
                    })
                  }
                />
              )}
            </SidebarPanel>
          </Box>
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
