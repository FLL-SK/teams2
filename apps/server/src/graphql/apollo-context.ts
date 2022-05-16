import { ObjectId } from 'mongodb';

export interface AuthProfileData {
  email: string;
  email_verified: boolean;
  picture?: string;
  permissions: {
    canImpersonateAnyUser: boolean;
  };
}


export const apolloContextEmpty: ApolloContext = {
  currentAccountId: null,
  userTimeZone: 'Europe/Bratislava'
};

export type ApolloContextDataSources = {
  
};

export interface ApolloContext {
  currentAccountId: ObjectId;
  dataSources?: ApolloContextDataSources;
  userTimeZone: string;
}
