import { Address } from '../_generated/graphql';

export const formatPhone = (phoneNo: string | undefined | null) => {
  if (!phoneNo) {
    return '';
  }

  const cleaned = ('' + phoneNo)
    .replace(/\D/g, '')
    .replace(/^00/, '+')
    .replace(/^0/, '+421')
    .replace(/^421/, '+421');
  return cleaned;
};

export const fullAddressNoName = (a?: Omit<Address, '__typename'> | null) =>
  a ? `${a.street}, ${a.city} ${a.zip}` : undefined;
