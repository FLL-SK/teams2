import { UserListFilterValues } from './user-list-filter';

export function parseUserListSearchParams(searchParams: URLSearchParams): UserListFilterValues {
  const values: UserListFilterValues = {};
  if (searchParams.get('ii') === 'true') {
    values.includeInactive = true;
  }
  if (searchParams.get('ia') === 'true') {
    values.isAdmin = true;
  }
  if (searchParams.get('is') === 'true') {
    values.isSuperAdmin = true;
  }

  return values;
}

export function constructUserListSearchParams(values: UserListFilterValues): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (values.includeInactive) {
    searchParams.append('ii', 'true');
  }
  if (values.isAdmin) {
    searchParams.append('ia', 'true');
  }
  if (values.isSuperAdmin) {
    searchParams.append('is', 'true');
  }

  return searchParams;
}
