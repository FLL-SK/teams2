import { RegistrationData } from '../../models';
import { Registration } from '../../generated/graphql';

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
      registeredByUser: null,
      invoiceIssuedByUser: null,
    };
    return u;
  },
};
