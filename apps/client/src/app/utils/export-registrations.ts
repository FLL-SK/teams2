import { NestedObjectLeaves } from '@teams2/common';
import { json2Aoa, Json2AoaInputType } from './json-to-aoa';
import { ArrayOfArraysOfAny, saveXlsx } from './save-xlsx';

interface ExportSourceType {
  registeredOn: string;
  paidOn?: string | null;
  confirmedOn?: string | null;
  coachCount: number;
  childrenCount: number;
  sizeConfirmedOn?: string | null;

  name: string;
  address: {
    name: string;
    city: string;
    street: string;
    zip: string;
  };

  eventName: string;

  coach1?: {
    name: string;
    phone?: string | null;
    email: string;
  };
  coach2?: {
    name: string;
    phone?: string | null;
    email: string;
  };
  coach3?: {
    name: string;
    phone?: string | null;
    email: string;
  };
}

type ExportFieldKey = NestedObjectLeaves<ExportSourceType>;

//TODO: add "id" field typechecking
export const fields: Json2AoaInputType<ExportSourceType>[] = [
  {
    label: 'Tím',
    id: 'name',
  },
  {
    label: 'Turnaj',
    id: 'eventName',
  },

  {
    label: 'Registrovaný',
    id: 'registeredOn',
    value: (x) => (x.registeredOn ? new Date(x.registeredOn) : ''),
  },
  {
    label: 'Reg. potvrdená',
    id: 'confirmedOn',
    value: (x) => (x.confirmedOn ? new Date(x.confirmedOn) : ''),
  },
  {
    label: 'Zaplatené',
    id: 'paidOn',
    value: (x) => (x.paidOn ? new Date(x.paidOn) : ''),
  },
  {
    label: 'Počty potvrdené',
    id: 'sizeConfirmedOn',
    value: (x) => (x.sizeConfirmedOn ? new Date(x.sizeConfirmedOn) : ''),
  },

  {
    label: 'Počet detí',
    id: 'childrenCount',
  },
  {
    label: 'Počet trénerov',
    id: 'coachCount',
  },
  {
    label: 'Zriaďovateľ-názov',
    id: 'address.name',
  },
  {
    label: 'Zriaďovateľ-mesto',
    id: 'address.city',
  },
  {
    label: 'Zriadďovateľ-ulica',
    id: 'address.street',
  },
  {
    label: 'Adresa-PSČ',
    id: 'address.zip',
  },
  {
    label: 'Tréner1-meno',
    id: 'coach1.name',
  },
  {
    label: 'Tréner1-telefon',
    id: 'coach1.phone',
  },
  {
    label: 'Tréner1-email',
    id: 'coach1.email',
  },
  {
    label: 'Tréner2-meno',
    id: 'coach2.name',
  },
  {
    label: 'Tréner2-telefon',
    id: 'coach2.phone',
  },
  {
    label: 'Tréner2-email',
    id: 'coach2.email',
  },
  {
    label: 'Tréner3-meno',
    id: 'coach3.name',
  },
  {
    label: 'Tréner3-telefon',
    id: 'coach3.phone',
  },
  {
    label: 'Tréner3-email',
    id: 'coach3.email',
  },
];

export function exportRegistrations(programName: string, registrations: ExportSourceType[]) {
  const aoa: ArrayOfArraysOfAny = json2Aoa<ExportSourceType>(registrations, fields);
  const today = new Date().toISOString().substring(0, 10);
  saveXlsx(aoa, `registrovane timy (${programName}) ${today}.xlsx`);
}
