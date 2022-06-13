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
  text: string;
  note?: string;
  unitPrice: number;
  quantity: number;
}
