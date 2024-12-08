import { flatten } from 'flat';
import { ArrayOfArraysOfAny } from './def-aoa';

export interface Json2AoaInputType<T> {
  id: string;
  label?: string;
  value?: (data: T) => string | number | Date;
}

type FlattenedRow = Record<string, string | number | Date>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toSDN = (data: any) => {
  if (
    typeof data === 'string' ||
    typeof data === 'number' ||
    (typeof data === 'object' && data instanceof Date)
  ) {
    return data;
  } else {
    return data ? data.toString() : '???';
  }
};

export function json2Aoa<T>(input: T[], fields?: Json2AoaInputType<T>[]): ArrayOfArraysOfAny {
  if (input.length === 0) {
    return [];
  }

  if (fields) {
    const aoa = input.map((row) => {
      const _r = flatten<T, FlattenedRow>(row);
      return fields.map((f) => (f.value ? f.value(row) : toSDN(_r[f.id])));
    });
    // if labels are provided then use them, othewise use the field ids
    aoa.unshift(fields.map((f) => (f.label ? f.label : f.id)));
    return aoa;
  } else {
    // if fields is not provided, then output will contain all the fields from the flattened input
    // and column headers will be the keys of the first row
    const _f = Object.keys(flatten(input[0]));
    const aoa = input.map((row: T) => _f.map((f) => flatten<T, FlattenedRow>(row)[f]));
    aoa.unshift(_f);
    return aoa;
  }
}
