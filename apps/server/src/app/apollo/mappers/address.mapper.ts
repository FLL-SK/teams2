import { AddressData } from '../../models';
import { Address } from '../../generated/graphql';

export const AddressMapper = {
  toAddress(address: AddressData | null | undefined): Address | null {
    if (!address) {
      return null;
    }
    const u: Omit<Required<Address>, '__typename'> = {
      id: address._id,
      name: address.name,
      street: address.street,
      city: address.city,
      zip: address.zip,
      countryCode: address.countryCode,
      companyNumber: address.companyNumber,
      vatNumber: address.vatNumber,
      taxNumber: address.taxNumber,
      contactName: address.contactName,
      email: address.email,
      phone: address.phone,
    };
    return u;
  },
};
