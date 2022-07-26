import * as XLSX from 'xlsx';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ArrayOfSDN = Array<string | Date | number>;
export type ArrayOfArraysOfAny = Array<ArrayOfSDN>;

export function saveXlsx(aoa: ArrayOfArraysOfAny, filename: string): void {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename);
}
