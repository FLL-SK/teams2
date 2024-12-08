import * as XLSX from 'xlsx';
import { ArrayOfArraysOfAny } from './def-aoa';

export function saveXlsx(aoa: ArrayOfArraysOfAny, filename: string): void {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename);
}
