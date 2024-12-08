import { ArrayOfArraysOfAny } from './def-aoa';

export function saveCsv(aoa: ArrayOfArraysOfAny, filename: string): void {
  const csvContent = 'data:text/csv;charset=utf-8,' + aoa.map((e) => e.join(',')).join('\n');

  const encodedUri = encodeURI(csvContent);

  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);

  document.body.appendChild(link); // Required for FF

  link.click();
}
