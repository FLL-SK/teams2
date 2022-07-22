import { RegistrationListFragmentFragment } from '../generated/graphql';
import { json2Aoa, Json2AoaInputType } from './json-to-aoa';
import { ArrayOfArraysOfAny, saveXlsx } from './save-xlsx';

export const fields: Json2AoaInputType[] = [
  {
    label: 'Tím',
    id: 'team.name',
  },
  {
    label: 'Turnaj',
    id: 'event.name',
  },

  {
    label: 'Registrovaný',
    id: 'registeredOn',
    value: (x: Record<string, unknown>) =>
      x.registeredOn ? new Date(x.registeredOn as string) : '',
  },
  {
    label: 'Fakturované',
    id: 'invoiceIssuedOn',
    value: (x: Record<string, unknown>) =>
      x.invoiceIssuedOn ? new Date(x.invoiceIssuedOn as string) : '',
  },
  {
    label: 'Zaplatené',
    id: 'paidOn',
    value: (x: Record<string, unknown>) => (x.paidOn ? new Date(x.paidOn as string) : ''),
  },
  {
    label: 'Dodacia skupina',
    id: 'shippingGroup',
  },
  {
    label: 'Adresa-názov',
    id: 'shipTo.name',
  },
  {
    label: 'Adresa-mesto',
    id: 'shipTo.city',
  },
  {
    label: 'Adresa-ulica',
    id: 'shipTo.city',
  },
  {
    label: 'Adresa-PSČ',
    id: 'shipTo.zip',
  },
  {
    label: 'Kontakt-meno',
    id: 'shipTo.contactName',
  },
  {
    label: 'Kontakt-telefon',
    id: 'shipTo.phone',
  },
  {
    label: 'Kontakt-email',
    id: 'shipTo.email',
  },
];

export function exportRegistrationsForShipping(
  programName: string,
  registrations: RegistrationListFragmentFragment[]
) {
  const aoa: ArrayOfArraysOfAny = json2Aoa(registrations, fields);
  const today = new Date().toISOString().substring(0, 10);
  saveXlsx(aoa, `registracie-pre-zasielanie (${programName}) ${today}.xlsx`);
}
