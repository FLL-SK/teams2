import { json2Aoa, Json2AoaInputType } from './json-to-aoa';
import { ArrayOfArraysOfAny, saveXlsx } from './save-xlsx';

interface ExportSourceType {
  createdOn: string;
  confirmedOn?: string | null;
  invoiceIssuedOn?: string | null;
  paidOn?: string | null;
  shipmentGroup?: string | null;

  type: string;
  setCount?: number | null;

  team: {
    name: string;
    shipTo?: {
      name: string;
      street: string;
      city: string;
      zip: string;
      contactName?: string | null;
      phone?: string | null;
      email?: string | null;
    } | null;
  };
}

export const fields: Json2AoaInputType<ExportSourceType>[] = [
  {
    label: 'Tím',
    id: 'team.name',
  },
  {
    label: 'Turnaj',
    id: 'event.name',
  },
  {
    label: 'Typ',
    id: 'type',
  },
  {
    label: 'Počet setov',
    id: 'setCount',
  },

  {
    label: 'Registrovaný',
    id: 'createdOn',
    value: (x) => (x.createdOn ? new Date(x.createdOn) : ''),
  },
  {
    label: 'Reg. potvrdená',
    id: 'confirmedOn',
    value: (x) => (x.confirmedOn ? new Date(x.confirmedOn) : ''),
  },
  {
    label: 'Fakturované',
    id: 'invoiceIssuedOn',
    value: (x) => (x.invoiceIssuedOn ? new Date(x.invoiceIssuedOn) : ''),
  },
  {
    label: 'Zaplatené',
    id: 'paidOn',
    value: (x) => (x.paidOn ? new Date(x.paidOn) : ''),
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
    id: 'shipTo.street',
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
  registrations: ExportSourceType[],
) {
  const aoa: ArrayOfArraysOfAny = json2Aoa<ExportSourceType>(registrations, fields);
  const today = new Date().toISOString().substring(0, 10);
  saveXlsx(aoa, `registracie-pre-zasielanie (${programName}) ${today}.xlsx`);
}
