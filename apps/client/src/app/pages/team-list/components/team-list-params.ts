import { TeamListFilterValues } from './team-list-filter';

export function parseTeamListSearchParams(searchParams: URLSearchParams): TeamListFilterValues {
  const values: TeamListFilterValues = {};
  if (searchParams.has('t')) {
    values.tags = searchParams.getAll('t');
  }
  if (searchParams.get('ii') === 'true') {
    values.includeInactive = true;
  }

  values.query = searchParams.get('q');

  return values;
}

export function constructTeamListSearchParams(values: TeamListFilterValues): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (values.tags) {
    values.tags.forEach((tag) => searchParams.append('t', tag));
  }

  if (values.includeInactive) {
    searchParams.append('ii', 'true');
  }

  if (values.query) {
    searchParams.append('q', values.query);
  }

  return searchParams;
}
