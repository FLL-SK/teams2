import { RegistrationData } from '../../models';
import { Registration } from '../../_generated/graphql';
import { AddressMapper } from './address.mapper';
import { OrderMapper } from './order.mapper';

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
      teamNo: registration.teamNo ?? 'xxx',

      billTo: AddressMapper.toAddress(registration.billTo),
      shipTo: AddressMapper.toAddress(registration.shipTo),

      createdOn: registration.createdOn,
      createdBy: registration.createdBy,
      confirmedOn: registration.confirmedOn,
      confirmedBy: registration.confirmedBy,

      canceledOn: registration.canceledOn,
      canceledBy: registration.canceledBy,

      invoiceIssuedOn: registration.invoiceIssuedOn,
      invoiceIssuedBy: registration.invoiceIssuedBy,
      invoiceSentOn: registration.invoiceSentOn,
      invoiceRef: registration.invoiceRef,
      invoiceNote: registration.invoiceNote,

      paidOn: registration.paidOn,

      shipmentGroup: registration.shipmentGroup,
      shippedOn: registration.shippedOn,

      girlCount: registration.girlCount ?? 0,
      boyCount: registration.boyCount ?? 0,
      coachCount: registration.coachCount ?? 0,

      sizeConfirmedOn: registration.sizeConfirmedOn,

      type: registration.type,
      impactedChildrenCount: registration.childrenImpacted ?? 0,
      impactedTeamCount: registration.teamsImpacted ?? 1,
      setCount: registration.setCount ?? 1,

      foodOrder: OrderMapper.toOrder(registration.foodOrder),

      invoiceItems: [],
      team: null,
      event: null,
      program: null,
      createdByUser: null,
      invoiceIssuedByUser: null,

      files: [],
    };
    return u;
  },
};
