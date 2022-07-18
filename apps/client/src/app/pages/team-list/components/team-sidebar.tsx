import React from 'react';
import { LabelValue } from '../../../components/label-value';
import { LabelValueGroup } from '../../../components/label-value-group';
import { ClosableSidebar } from '../../../components/sidebar';
import { SidebarPanel, SidebarPanelGroup } from '../../../components/sidebar-panel';
import { TagList } from '../../../components/tag-list';
import {
  TeamListFragmentFragment,
  useAddTagToTeamMutation,
  useDeleteTagMutation,
} from '../../../generated/graphql';
import { fullAddress } from '../../../utils/format-address';

interface TeamSidebarProps {
  team?: TeamListFragmentFragment;
  onClose: () => unknown;
}

export function TeamSidebar(props: TeamSidebarProps) {
  const { team, onClose } = props;
  const [removeTag] = useDeleteTagMutation();
  const [addTag] = useAddTagToTeamMutation();
  if (!team) {
    return null;
  }
  return (
    <ClosableSidebar onClose={onClose} show={!!team}>
      <SidebarPanelGroup title="Team" gap="medium">
        <SidebarPanel>
          <LabelValueGroup direction="column" gap="small">
            <LabelValue label="Názov" value={team.name} />
            <LabelValue label="Zriaďovateľ" value={fullAddress(team.address)} />
          </LabelValueGroup>
        </SidebarPanel>
        <SidebarPanel label="Štítky">
          <TagList
            tags={team.tags}
            onRemove={(id) => removeTag({ variables: { id } })}
            onAdd={(tag) => addTag({ variables: { teamId: team.id, tagId: tag.id } })}
          />
        </SidebarPanel>
      </SidebarPanelGroup>
    </ClosableSidebar>
  );
}

export default TeamSidebar;
