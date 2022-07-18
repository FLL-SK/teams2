import React, { useCallback, useState } from 'react';
import { ClosableSidebar } from '../../../components/sidebar';
import { SidebarPanel } from '../../../components/sidebar-panel';
import { TagList } from '../../../components/tag-list';
import { useGetTagsQuery } from '../../../generated/graphql';

export interface TeamListFilterValues {
  tags?: string[];
}

interface TeamListFilterProps {
  show: boolean;
  onClose: () => unknown;
  onChange: (values: TeamListFilterValues) => unknown;
  values: TeamListFilterValues;
}

export function TeamListFilter(props: TeamListFilterProps) {
  const { onClose, show, onChange, values } = props;
  const [filterTags, setFilterTags] = useState<string[]>(values.tags ?? []);
  const { data: tagsData, loading: loadingTags, error: tagsError } = useGetTagsQuery();

  const addTagToFilter = useCallback(
    (id: string) => {
      if (!filterTags.includes(id)) {
        const nf = [...filterTags, id];
        setFilterTags(nf); //FIXME: needed if onchnage will trigger rerender?
        onChange({ ...values, tags: nf });
      }
    },
    [filterTags, onChange, values]
  );

  const removeTagFromFilter = useCallback(
    (id: string) => {
      const nf = filterTags.filter((t) => t !== id);
      setFilterTags(nf); //FIXME: needed if onchnage will trigger rerender?
      onChange({ ...values, tags: nf });
    },
    [filterTags, onChange, values]
  );

  return (
    <ClosableSidebar onClose={onClose} show={show} title="Filter">
      <SidebarPanel label="Štítky">
        <TagList
          tags={(tagsData?.getTags ?? []).filter((t) => filterTags.includes(t.id))}
          onRemove={(id) => removeTagFromFilter(id)}
          onAdd={(tag) => addTagToFilter(tag.id)}
          noCreate
        />
      </SidebarPanel>
    </ClosableSidebar>
  );
}

export default TeamListFilter;
