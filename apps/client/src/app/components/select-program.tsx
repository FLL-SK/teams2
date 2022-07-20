import React from 'react';
import { Select, Spinner } from 'grommet';
import { useEffect, useState } from 'react';
import { ProgramListFragmentFragment, useGetProgramsQuery } from '../generated/graphql';

interface SelectProgramProps {
  onSelect: (data: ProgramListFragmentFragment) => void;
  onClose?: () => void;
  disabled?: boolean;
  value?: string;
}

export function SelectProgram(props: SelectProgramProps) {
  const { onSelect, onClose, disabled, value } = props;
  const { data, loading } = useGetProgramsQuery();
  const [options, setOptions] = useState<ProgramListFragmentFragment[]>([]);

  useEffect(() => {
    if (!loading) {
      setOptions([...(data?.getPrograms ?? [])]);
    }
  }, [loading, data]);

  // TODO: replace string compare with regexp ignoring case in onSearch lambda
  return (
    <>
      {!loading && !disabled && (
        <Select
          key={`select${value}`}
          autoFocus
          options={options}
          labelKey={(o) => o.name}
          onChange={(e) => onSelect(e.value)}
          onClose={() => onClose && onClose()}
          searchPlaceholder="Hľadaj"
          emptySearchMessage="Nenájdené"
          value={options.find((o) => o.id === value)}
          onSearch={(s: string) =>
            setOptions([...(data?.getPrograms ?? []).filter((o) => o.name.includes(s))])
          }
        />
      )}
      {loading && <Spinner />}
    </>
  );
}
