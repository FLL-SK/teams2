import { RegistrationData } from '../../models';
import { Registration } from '../../generated/graphql';

export const RegistrationMapper = {
  toRegistration(registration: RegistrationData | null | undefined): Registration | null {
    if (!registration) {
      return null;
    }
    const u: Omit<Required<Registration>, '__typename'> = {
      id: registration._id,
      teamId: registration.teamId,
      eventId: registration.eventId,
      registeredOn: registration.registeredOn,
      teamSize: registration.teamSize,
      sizeConfirmedOn: registration.sizeConfirmedOn,

      team: null,
      event: null,
    };
    return u;
  },
};
