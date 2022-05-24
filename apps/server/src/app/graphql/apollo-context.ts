import { UserDataSource } from '../datasources';
import { User } from '../generated/graphql';

export interface AuthProfileData {
  email: string;
}

export const apolloContextEmpty: ApolloContext = {
  user: null,
  userTimeZone: 'Europe/Bratislava',
};

export type ApolloContextDataSources = {
  user: UserDataSource;
};

export interface ApolloContext {
  user: User;
  userTimeZone: string;
  dataSources?: ApolloContextDataSources;
  authProfileData?: AuthProfileData;
}
