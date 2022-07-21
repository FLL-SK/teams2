import { RegistrationTeamFragmentFragment } from '../generated/graphql';
import { json2Aoa, Json2AoaInputType } from './json-to-aoa';
import { ArrayOfArraysOfAny, saveXlsx } from './save-xlsx';

export const fields: Json2AoaInputType[] = [
  {
    label: 'Tím',
    id: 'team.name',
  },
  {
    label: 'Registrovaný',
    id: 'registeredOn',
    value: (x: Record<string, unknown>) => new Date(x.date as string),
  },
  {
    label: 'Zriaďovateľ-názov',
    id: 'team.address.name',
  },
  {
    label: 'Zriaďovateľ-mesto',
    id: 'team.address.city',
  },
  {
    label: 'Zriaďovateľ-ulica',
    id: 'team.address.city',
  },
  {
    label: 'Zriaďovateľ-PSČ',
    id: 'team.address.zip',
  },
];

export function exportRegistrations(
  programName: string,
  registrations: RegistrationTeamFragmentFragment[]
) {
  const aoa: ArrayOfArraysOfAny = json2Aoa(registrations, fields);
  const today = new Date().toISOString().substring(0, 10);
  saveXlsx(aoa, `registracie (${programName}) ${today}.xlsx`);
}
