import { EventDataSource, ProgramDataSource, TeamDataSource, UserDataSource } from './datasources';
import { UserData } from '../models';

export interface AuthProfileData {
  email: string;
}

export const apolloContextEmpty: ApolloContext = {
  user: null,
  userTimeZone: 'Europe/Bratislava',
};

export type ApolloContextDataSources = {
  user: UserDataSource;
  event: EventDataSource;
  team: TeamDataSource;
  program: ProgramDataSource;
};

export interface ApolloContext {
  user: Omit<UserData, 'password'> | null;
  userTimeZone: string;
  dataSources?: ApolloContextDataSources;
  authProfileData?: AuthProfileData;
}
