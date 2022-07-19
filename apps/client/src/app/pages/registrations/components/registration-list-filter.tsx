import React, { useCallback, useState } from 'react';
import { ClosableSidebar } from '../../../components/sidebar';
import { SidebarPanel } from '../../../components/sidebar-panel';
import { TagList } from '../../../components/tag-list';
import { useGetTagsQuery } from '../../../generated/graphql';

export interface RegistrationListFilterValues {
  tags?: string[];
  programId?: string | null;
}

interface RegistrationListFilterProps {
  show: boolean;
  onClose: () => unknown;
  onChange: (values: RegistrationListFilterValues) => unknown;
  values: RegistrationListFilterValues;
}

export function RegistrationListFilter(props: RegistrationListFilterProps) {
  const { onClose, show, onChange, values } = props;
  const [filterTags, setFilterTags] = useState<string[]>(values.tags ?? []);
  const { data: tagsData, loading: loadingTags, error: tagsError } = useGetTagsQuery();

  const addTagToFilter = useCallback(
    (id: string) => {
      if (!filterTags.includes(id)) {
        const tags = [...filterTags, id];
        setFilterTags(tags); //FIXME: needed if onchnage will trigger rerender?
        onChange({ ...values, tags });
      }
    },
    [filterTags, onChange, values]
  );

  const removeTagFromFilter = useCallback(
    (id: string) => {
      const tags = filterTags.filter((t) => t !== id);
      setFilterTags(tags); //FIXME: needed if onchnage will trigger rerender?
      if (tags.length === 0) {
        const nf = { ...values };
        delete nf.tags;
        onChange(nf);
      } else {
        onChange({ ...values, tags });
      }
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

export default RegistrationListFilter;
