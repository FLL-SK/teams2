import { Address } from '../generated/graphql';

export const fullAddress = (a?: Omit<Address, '__typename'>) =>
  a ? `${a.name}, ${a.street}, ${a.city}` : undefined;
