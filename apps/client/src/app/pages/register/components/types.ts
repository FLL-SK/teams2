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
  items?: Item[];
}

export interface Item {
  lineNo: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}
