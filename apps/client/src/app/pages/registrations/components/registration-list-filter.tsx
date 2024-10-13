import React, { useCallback, useMemo } from 'react';

import { Anchor, CheckBox, RadioButtonGroup, Spinner, TextInput } from 'grommet';
import { SelectProgram } from '../../../components/select-program';
import { ClosableSidebar } from '../../../components/sidebar';
import { SidebarPanel, SidebarPanelGroup } from '../../../components/sidebar-panel';
import { TagList } from '../../../components/tag-list';
import { useGetTagsQuery } from '../../../_generated/graphql';

export interface RegistrationListFilterValues {
  tags?: string[];
  programId?: string | null;
  shipmentGroup?: string | null;
  notInvoiced?: boolean;
  notPaid?: boolean;
  notShipped?: boolean;
  notConfirmedSize?: boolean;
  notConfirmed?: boolean;
  showInactivePrograms?: boolean;
  regType?: 'prog' | 'event';
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
    [filterTags, onChange, values],
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
    [filterTags, onChange, values],
  );

  return (
    <ClosableSidebar onClose={onClose} show={show} title="Filter" width="350px">
      <SidebarPanelGroup gap="small">
        <SidebarPanel label="Program">
          <CheckBox
            toggle={true}
            label="Ukázať neaktívne programy"
            checked={values.showInactivePrograms ?? false}
            onChange={() =>
              onChange({ ...values, showInactivePrograms: !values.showInactivePrograms })
            }
          />
          <SelectProgram
            onSelect={(prg) => onChange({ ...values, programId: prg.id })}
            showOnlyActive={!values.showInactivePrograms}
            value={values.programId ?? ''}
          />
        </SidebarPanel>
        <SidebarPanel>
          <RadioButtonGroup
            name="regType"
            options={[
              { label: 'Registrácie do programu', value: 'prog' },
              { label: 'Registrácie na turnaj', value: 'event' },
            ]}
            value={values.regType ?? 'event'}
            onChange={(e) => onChange({ ...values, regType: e.target.value as 'prog' | 'event' })}
          />
        </SidebarPanel>
        <SidebarPanel>
          <CheckBox
            toggle={true}
            label="Nepotvrdené"
            checked={values.notConfirmed ?? false}
            onChange={() => onChange({ ...values, notConfirmed: !values.notConfirmed })}
          />
          <CheckBox
            toggle={true}
            label="Nefakturované"
            checked={values.notInvoiced ?? false}
            onChange={() => onChange({ ...values, notInvoiced: !values.notInvoiced })}
          />
          <CheckBox
            toggle={true}
            label="Nezaplatené"
            checked={values.notPaid ?? false}
            onChange={() => onChange({ ...values, notPaid: !values.notPaid })}
          />
          <CheckBox
            toggle={true}
            label="Neodoslané"
            checked={values.notShipped ?? false}
            onChange={() => onChange({ ...values, notShipped: !values.notShipped })}
          />
          <CheckBox
            toggle={true}
            label="Nepotvrdený počet"
            checked={values.notConfirmedSize ?? false}
            onChange={() => onChange({ ...values, notConfirmedSize: !values.notConfirmedSize })}
          />
        </SidebarPanel>
        <SidebarPanel label="Zásielka č.">
          <TextInput
            value={values.shipmentGroup ?? ''}
            onChange={(e) => onChange({ ...values, shipmentGroup: e.target.value })}
          />
        </SidebarPanel>
        <SidebarPanel label="Štítky tímu">
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
          <Anchor onClick={() => onChange({ programId: values.programId })}>Zrušiť filter</Anchor>
        </SidebarPanel>
      </SidebarPanelGroup>
    </ClosableSidebar>
  );
}

export default RegistrationListFilter;
