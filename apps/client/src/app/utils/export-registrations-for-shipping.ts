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
    value: (x: Record<string, unknown>) => new Date(x.registeredOn as string),
  },
  {
    label: 'Zásielka č.',
    id: 'team.shippingGroup',
  },
  {
    label: 'Adresa-názov',
    id: 'team.shipTo.name',
  },
  {
    label: 'Adresa-mesto',
    id: 'team.shipTo.city',
  },
  {
    label: 'Adresa-ulica',
    id: 'team.shipTo.city',
  },
  {
    label: 'Adresa-PSČ',
    id: 'team.shipTo.zip',
  },
  {
    label: 'Kontakt-meno',
    id: 'team.shipTo.contactName',
  },
  {
    label: 'Kontakt-telefon',
    id: 'team.shipTo.phone',
  },
  {
    label: 'Kontakt-email',
    id: 'team.shipTo.email',
  },
];

export function exportRegistrationsForShipping(
  programName: string,
  registrations: RegistrationTeamFragmentFragment[]
) {
  const aoa: ArrayOfArraysOfAny = json2Aoa(registrations, fields);
  const today = new Date().toISOString().substring(0, 10);
  saveXlsx(aoa, `registracie-pre-zasielanie (${programName}) ${today}.xlsx`);
}
