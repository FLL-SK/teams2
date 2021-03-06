import React, { useCallback, useMemo } from 'react';

import { Anchor, CheckBox, Spinner, TextInput } from 'grommet';
import { SelectProgram } from '../../../components/select-program';
import { ClosableSidebar } from '../../../components/sidebar';
import { SidebarPanel, SidebarPanelGroup } from '../../../components/sidebar-panel';
import { TagList } from '../../../components/tag-list';
import { useGetTagsQuery } from '../../../generated/graphql';

export interface RegistrationListFilterValues {
  tags?: string[];
  programId?: string | null;
  shipmentGroup?: string | null;
  notInvoiced?: boolean;
  notPaid?: boolean;
  notShipped?: boolean;
  notConfirmedSize?: boolean;
}

interface RegistrationListFilterProps {
  show: boolean;
  onClose: () => unknown;
  onChange: (values: RegistrationListFilterValues) => unknown;
  values: RegistrationListFilterValues;
}

export function RegistrationListFilter(props: RegistrationListFilterProps) {
  const { onClose, show, onChange, values } = props;

  const { data: tagsData, loading: loadingTags } = useGetTagsQuery();

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
        <SidebarPanel>
          <CheckBox
            toggle={true}
            label="Nefakturovan??"
            checked={values.notInvoiced ?? false}
            onChange={() => onChange({ ...values, notInvoiced: !values.notInvoiced })}
          />
          <CheckBox
            toggle={true}
            label="Nezaplaten??"
            checked={values.notPaid ?? false}
            onChange={() => onChange({ ...values, notPaid: !values.notPaid })}
          />
          <CheckBox
            toggle={true}
            label="Neodoslan??"
            checked={values.notShipped ?? false}
            onChange={() => onChange({ ...values, notShipped: !values.notShipped })}
          />
          <CheckBox
            toggle={true}
            label="Nepotvrden?? po??et"
            checked={values.notConfirmedSize ?? false}
            onChange={() => onChange({ ...values, notConfirmedSize: !values.notConfirmedSize })}
          />
        </SidebarPanel>
        <SidebarPanel label="Z??sielka ??.">
          <TextInput
            value={values.shipmentGroup ?? ''}
            onChange={(e) => onChange({ ...values, shipmentGroup: e.target.value })}
          />
        </SidebarPanel>
        <SidebarPanel label="??t??tky">
          {loadingTags && <Spinner />}
          {!loadingTags && (
            <TagList
              tags={(tagsData?.getTags ?? []).filter((t) => filterTags.includes(t.id))}
              onRemove={(id) => removeTagFromFilter(id)}
              onAdd={(tag) => addTagToFilter(tag.id)}
              noCreate
            />
          )}
        </SidebarPanel>
        <SidebarPanel label="">
          <Anchor onClick={() => onChange({ programId: values.programId })}>Zru??i?? filter</Anchor>
        </SidebarPanel>
      </SidebarPanelGroup>
    </ClosableSidebar>
  );
}

export default RegistrationListFilter;
