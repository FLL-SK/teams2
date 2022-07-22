import React from 'react';

import { formatDate } from '@teams2/dateutils';
import { Box, Spinner, Text } from 'grommet';

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
} from '../../../generated/graphql';
import { fullAddress } from '../../../utils/format-address';

import { FieldInvoiceIssuedOn } from './field-invoiceIssuedOn';
import { FieldPaidOn } from './field-paidOn';
import { FieldShipmentGroup } from './field-shipmentGroup';
import { FieldShippedOn } from './field-shippedOn';
import { FieldTeamSize } from './field-teamSize';
import { FieldTeamSizeConfirmedOn } from './field-teamSizeConfirmedOn';

interface RegistrationSidebarProps {
  registrationId?: string;
  onClose: () => unknown;
}

export function RegistrationSidebar(props: RegistrationSidebarProps) {
  const { registrationId, onClose } = props;

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

  const registration = regData?.getRegistration;

  if (!registration) {
    return null;
  }

  return (
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
              <LabelValue label="Zriaďovateľ tímu" value={fullAddress(registration.team.address)} />
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
              <FieldInvoiceIssuedOn registration={registration} />
              <FieldPaidOn registration={registration} />
              <FieldShipmentGroup registration={registration} />
              <FieldShippedOn registration={registration} />
              <FieldTeamSize registration={registration} />
              <FieldTeamSizeConfirmedOn registration={registration} />
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
  );
}

export default RegistrationSidebar;
