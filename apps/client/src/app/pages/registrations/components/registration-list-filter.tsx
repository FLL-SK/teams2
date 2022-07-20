import React, { useCallback, useMemo, useState } from 'react';

import { Anchor } from 'grommet';
import { SelectProgram } from '../../../components/select-program';
import { ClosableSidebar } from '../../../components/sidebar';
import { SidebarPanel, SidebarPanelGroup } from '../../../components/sidebar-panel';
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

  const { data: tagsData, loading: loadingTags, error: tagsError } = useGetTagsQuery();

  const filterTags = useMemo(() => values.tags ?? [], [values.tags]);

  const addTagToFilter = useCallback(
    (id: string) => {
      if (!filterTags.includes(id)) {
        const tags = [...filterTags, id];
        onChange({ ...values, tags });
      }
    },
    [filterTags, onChange, values]
  );

  const removeTagFromFilter = useCallback(
    (id: string) => {
      const tags = filterTags.filter((t) => t !== id);
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
    <ClosableSidebar onClose={onClose} show={show} title="Filter" width="350px">
      <SidebarPanelGroup gap="small">
        <SidebarPanel label="Program">
          <SelectProgram
            onSelect={(prg) => onChange({ ...values, programId: prg.id })}
            value={values.programId ?? ''}
          />
        </SidebarPanel>
        <SidebarPanel label="Štítky">
          <TagList
            tags={(tagsData?.getTags ?? []).filter((t) => filterTags.includes(t.id))}
            onRemove={(id) => removeTagFromFilter(id)}
            onAdd={(tag) => addTagToFilter(tag.id)}
            noCreate
          />
        </SidebarPanel>
        <SidebarPanel label="">
          <Anchor onClick={() => onChange({ programId: values.programId })}>Zrušiť filter</Anchor>
        </SidebarPanel>
      </SidebarPanelGroup>
    </ClosableSidebar>
  );
}

export default RegistrationListFilter;
