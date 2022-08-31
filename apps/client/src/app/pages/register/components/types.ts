import {
  Address as AddressGQL,
  EventListFragmentFragment,
  ProgramListFragmentFragment,
} from '../../../generated/graphql';

export type Address = AddressGQL;

export interface RegisterDetails {
  program?: ProgramListFragmentFragment;
  event?: EventListFragmentFragment;
  shipTo?: Address;
  billTo?: Address;
  billToContact?: Contact;
  useBillTo?: boolean;
  items?: Item[];
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface Item {
  lineNo: number;
  text: string;
  note?: string;
  unitPrice: number;
  quantity: number;
}
