import {
  EventDataSource,
  RegistrationDataSource,
  FileDataSource,
  InvoiceItemDataSource,
  NoteDataSource,
  ProgramDataSource,
  TagDataSource,
  TeamDataSource,
  UserDataSource,
} from './datasources';
import { UserDataNoPassword } from '../models';
import { UserGuard } from '../utils/user-guard';

export interface AuthProfileData {
  email: string;
}

export const apolloContextEmpty: ApolloContext = {
  user: null,
  userGuard: new UserGuard(null),
  userTimeZone: 'Europe/Bratislava',
};

export type ApolloContextDataSources = {
  user: UserDataSource;
  event: EventDataSource;
  registration: RegistrationDataSource;
  team: TeamDataSource;
  program: ProgramDataSource;
  invoice: InvoiceItemDataSource;
  file: FileDataSource;
  tag: TagDataSource;
  note: NoteDataSource;
};

export interface ApolloContext {
  user: UserDataNoPassword | null;
  userGuard: UserGuard;
  userTimeZone: string;
  dataSources?: ApolloContextDataSources;
  authProfileData?: AuthProfileData;
}
