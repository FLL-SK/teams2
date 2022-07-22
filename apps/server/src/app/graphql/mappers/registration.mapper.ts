import { RegistrationData } from '../../models';
import { Registration } from '../../generated/graphql';
import { AddressMapper } from './address.mapper';

export const RegistrationMapper = {
  toRegistration(registration: RegistrationData | null | undefined): Registration | null {
    if (!registration) {
      return null;
    }
    const u: Omit<Required<Registration>, '__typename'> = {
      id: registration._id,
      programId: registration.programId,
      eventId: registration.eventId,
      teamId: registration.teamId,

      billTo: AddressMapper.toAddress(registration.billTo),
      shipTo: AddressMapper.toAddress(registration.shipTo),

      registeredOn: registration.registeredOn,
      registeredBy: registration.registeredBy,
      invoiceIssuedOn: registration.invoiceIssuedOn,
      invoiceIssuedBy: registration.invoiceIssuedBy,
      paidOn: registration.paidOn,
      shipmentGroup: registration.shipmentGroup,
      shippedOn: registration.shippedOn,

      teamSize: registration.teamSize,
      sizeConfirmedOn: registration.sizeConfirmedOn,

      team: null,
      event: null,
      program: null,
      registeredByUser: null,
      invoiceIssuedByUser: null,
    };
    return u;
  },
};
