import { RegistrationListFilterValues } from './registration-list-filter';

export function parseRegistrationsSearchParams(
  searchParams: URLSearchParams,
): RegistrationListFilterValues {
  const values: RegistrationListFilterValues = {};
  if (searchParams.has('t')) {
    values.tags = searchParams.getAll('t');
  }
  if (searchParams.has('p')) {
    values.programId = searchParams.get('p');
  }
  if (searchParams.has('sg')) {
    values.shipmentGroup = searchParams.get('sg');
  }
  if (searchParams.has('ni')) {
    values.notInvoiced = searchParams.get('ni') === 'true';
  }
  if (searchParams.has('np')) {
    values.notPaid = searchParams.get('np') === 'true';
  }
  if (searchParams.has('ns')) {
    values.notShipped = searchParams.get('ns') === 'true';
  }
  if (searchParams.has('ncs')) {
    values.notConfirmedSize = searchParams.get('ncs') === 'true';
  }
  if (searchParams.has('nc')) {
    values.notConfirmed = searchParams.get('nc') === 'true';
  }
  if (searchParams.has('ip')) {
    values.showInactivePrograms = searchParams.get('ip') === 'true';
  }
  return values;
}

export function constructRegistrationsSearchParams(
  values: RegistrationListFilterValues,
): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (values.tags) {
    values.tags.forEach((tag) => searchParams.append('t', tag));
  }
  if (values.programId) {
    searchParams.append('p', values.programId);
  }
  if (values.shipmentGroup) {
    searchParams.append('sg', values.shipmentGroup);
  }
  if (values.notInvoiced) {
    searchParams.append('ni', 'true');
  }
  if (values.notPaid) {
    searchParams.append('np', 'true');
  }
  if (values.notShipped) {
    searchParams.append('ns', 'true');
  }
  if (values.notConfirmedSize) {
    searchParams.append('ncs', 'true');
  }
  if (values.notConfirmed) {
    searchParams.append('nc', 'true');
  }
  if (values.showInactivePrograms) {
    searchParams.append('ip', 'true');
  }

  return searchParams;
}
