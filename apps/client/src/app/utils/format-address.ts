import { Address } from '../_generated/graphql';

export const fullAddress = (
  a?: { name: string; street: string; city: string; zip: string } | null,
) => (a ? `${a.name}, ${a.street}, ${a.city} ${a.zip}` : undefined);

export const fullAddressNoName = (
  a?: { name?: string; street: string; city: string; zip: string } | null,
) => (a ? `${a.street}, ${a.city} ${a.zip}` : undefined);
