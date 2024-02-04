import React from 'react';
import { Select, Spinner } from 'grommet';
import { useEffect, useState } from 'react';
import {
  TagColorType,
  TagFragmentFragment,
  useCreateTagMutation,
  useGetTagsQuery,
} from '../_generated/graphql';

interface SelectTagProps {
  selected?: string[]; // already selected tags ids
  onSelect: (t: TagFragmentFragment) => void;
  onClose?: () => void;
  disabled?: boolean;
  defaultValue?: string;
  readonly?: boolean;
}

const createTagIndicator = 'z';
const defaultColor: TagColorType = 'TC1';

export function SelectTag(props: SelectTagProps) {
  const { onSelect, onClose, disabled, readonly, defaultValue, selected } = props;
  const { data, loading, refetch } = useGetTagsQuery();
  const [options, setOptions] = useState<TagFragmentFragment[]>([]);
  const [createTag] = useCreateTagMutation({ onCompleted: () => refetch() });

  useEffect(() => {
    if (!loading) {
      setOptions((data?.getTags ?? []).filter((t) => !selected?.includes(t.id)));
    }
  }, [loading, data, selected]);

  const onSelectPrim = async (t: TagFragmentFragment) => {
    if (t.id === createTagIndicator) {
      try {
        const res = await createTag({ variables: { input: { label: t.label } } });
        if (!res.errors && res.data && res.data.createTag) {
          onSelect(res.data.createTag);
        }
        // TODO: handle errors
      } catch (err) {
        // TODO: handle errors
      }
    } else {
      onSelect(t);
    }
  };

  // TODO: replace string compare with regexp ignoring case in onSearch lambda
  return (
    <>
      {!loading && !disabled && (
        <Select
          key={`select${defaultValue}`}
          autoFocus
          options={options}
          labelKey={(o) => (o.id === createTagIndicator ? `Vytvor ${o.label}` : o.label)}
          onChange={(e) => onSelectPrim(e.value)}
          onClose={() => onClose && onClose()}
          searchPlaceholder="Hľadaj"
          emptySearchMessage="Nenájdené"
          value={options.find((o) => o.id === defaultValue)}
          onSearch={(s: string) =>
            setOptions([
              ...(!readonly && (data?.getTags ?? []).findIndex((o) => o.label === s) < 0
                ? [{ id: createTagIndicator, label: s, color: defaultColor }]
                : []),
              ...(data?.getTags ?? []).filter((o) => o.label.includes(s)),
            ])
          }
        />
      )}
      {loading && <Spinner />}
    </>
  );
}
