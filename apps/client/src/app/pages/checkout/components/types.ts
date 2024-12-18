import {
  Address as AddressGQL,
  AddressInput,
  EventListFragmentFragment,
  ProductFragment,
  ProgramListFragmentFragment,
  RegistrationType,
} from '../../../_generated/graphql';

export type Address = AddressGQL;

export interface CheckoutDetails {
  teamId: string;
  item?: ProductFragment;
  program?: ProgramListFragmentFragment;
  event?: EventListFragmentFragment;
  shipTo?: AddressInput;
  billTo?: AddressInput;
  billToContact?: Contact;
  useBillTo?: boolean;
  items?: Item[];
  type: RegistrationType;
  teamsImpacted?: number;
  childrenImpacted?: number;
  setCount?: number;
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
