import { formatDate } from '@teams2/dateutils';
import { Spinner } from 'grommet';
import React from 'react';
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
} from '../../../generated/graphql';
import { fullAddress } from '../../../utils/format-address';

interface RegistrationSidebarProps {
  registration?: RegistrationTeamFragmentFragment;
  onClose: () => unknown;
}

export function RegistrationSidebar(props: RegistrationSidebarProps) {
  const { registration, onClose } = props;

  const {
    data: notesData,
    loading: notesLoading,
    refetch: notesRefetch,
  } = useGetNotesQuery({
    variables: { type: 'registration', ref: registration?.id ?? '0' },
  });

  const [removeTag] = useDeleteTagMutation();
  const [addTag] = useAddTagToTeamMutation();
  const [createNote] = useCreateNoteMutation({ onCompleted: () => notesRefetch() });

  if (!registration) {
    return null;
  }
  return (
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
            onAdd={(tag) => addTag({ variables: { teamId: registration.team.id, tagId: tag.id } })}
          />
        </SidebarPanel>
        <SidebarPanel label="Registrácia">
          <LabelValueGroup direction="column" gap="small">
            <LabelValue label="Registrácia" value={formatDate(registration.registeredOn)} />
            <LabelValue
              label="Faktúra"
              value={registration.invoiceIssuedOn ? formatDate(registration.invoiceIssuedOn) : '-'}
            />
            <LabelValue
              label="Zaplatená"
              value={registration.paidOn ? formatDate(registration.paidOn) : '-'}
            />
            <LabelValue label="Zásielka č." value={registration.shipmentGroup ?? '-'} />
            <LabelValue
              label="Odoslaná"
              value={registration.shippedOn ? formatDate(registration.shippedOn) : '-'}
            />
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
  );
}

export default RegistrationSidebar;
