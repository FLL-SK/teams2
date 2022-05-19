import { UserDataSource } from '../datasources';
import { User } from '../generated/graphql';

export interface AuthProfileData {
  email: string;
  email_verified: boolean;
  picture?: string;
}

export const apolloContextEmpty: ApolloContext = {
  user: null,
  userVerified: false,
  userTimeZone: 'Europe/Bratislava',
};

export type ApolloContextDataSources = {
  user: UserDataSource;
};

export interface ApolloContext {
  user: User;
  userVerified: boolean;
  userTimeZone: string;
  dataSources?: ApolloContextDataSources;
  authProfileData?: AuthProfileData;
}
