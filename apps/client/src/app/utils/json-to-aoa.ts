import flatten from 'flat';

export interface Json2AoaInputType {
  id: string;
  label?: string;
  value?: (data: Record<string, unknown>) => string | number | Date;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordType = Record<string, any>;

export function json2Aoa(input: RecordType[], fields?: Json2AoaInputType[]) {
  if (input.length === 0) {
    return [];
  }

  if (fields) {
    const aoa = input.map((row) => {
      const _r: RecordType = flatten(row);
      return fields.map((f) => (f.value ? f.value(row) : _r[f.id]));
    });
    // if labels are provided then use them, othewise use the field ids
    aoa.unshift(fields.map((f) => (f.label ? f.label : f.id)));
    return aoa;
  } else {
    // if fields is not provided, then output will contain all the fields from the flattened input
    // and column headers will be the keys of the first row
    const _f = Object.keys(flatten(input[0]));
    const aoa = input.map((row: RecordType) =>
      _f.map((f) => flatten<RecordType, RecordType>(row)[f])
    );
    aoa.unshift(_f);
    return aoa;
  }
}
