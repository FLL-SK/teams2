import { Address } from '../generated/graphql';

export const fullAddress = (a?: Omit<Address, '__typename'> | null) =>
  a ? `${a.name}, ${a.street}, ${a.city} ${a.zip}` : undefined;
