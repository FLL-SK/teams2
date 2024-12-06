import { NestedObjectLeaves } from '@teams2/common';
import { json2Aoa, Json2AoaInputType } from './json-to-aoa';
import { ArrayOfArraysOfAny, saveXlsx } from './save-xlsx';

interface ExportSourceType {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  teamName: string;
  teamNo: string;
  teamCountry: string;
  teamRegion: string;
}

type ExportFieldKey = NestedObjectLeaves<ExportSourceType>;

//TODO: add "id" field typechecking
export const fields: Json2AoaInputType<ExportSourceType>[] = [
  {
    label: 'CoachEmail',
    id: 'email',
  },
  {
    label: 'CoachFirstName',
    id: 'firstName',
  },
  {
    label: 'CoachLastName',
    id: 'lastName',
  },

  {
    label: 'CoachPhone',
    id: 'phone',
  },
  {
    label: 'TeamName',
    id: 'teamName',
  },
  {
    label: 'TeamNumber',
    id: 'teamNo',
  },
  {
    label: 'TeamCountry',
    id: 'teamCountry',
  },

  {
    label: 'TeamRegion',
    id: 'teamRegion',
  },
];

export function exportRegistrationsForEventHub(
  batchName: string,
  registrations: ExportSourceType[],
) {
  const aoa: ArrayOfArraysOfAny = json2Aoa<ExportSourceType>(registrations, fields);
  const today = new Date().toISOString().substring(0, 10);
  saveXlsx(aoa, `eventhub timy (${batchName}) ${today}.xlsx`);
}
