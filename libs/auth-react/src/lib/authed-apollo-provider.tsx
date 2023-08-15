import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import omitDeep from 'omit-deep';
import React from 'react';

interface AuthedApolloProviderProps {
  children: React.ReactNode;
}

export const AuthedApolloProvider = ({
  children,
  apiUri,
  apiToken,
}: AuthedApolloProviderProps & { apiUri: string; apiToken?: string | null }) => {
  const httpLink = createHttpLink({ uri: apiUri });

  // cleans __typename from the input data
  // SEE: https://stackoverflow.com/questions/47211778/cleaning-unwanted-fields-from-graphql-responses/51380645#51380645
  const cleanTypeName = new ApolloLink((operation, forward) => {
    if (operation.variables) {
      operation.variables = omitDeep(operation.variables, ['__typename']);
    }
    return forward(operation).map((data) => {
      return data;
    });
  });

  const authLink = setContext(() => {
    // return authorization header with jwt token
    const token = apiToken;
    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
          'Apollo-Require-Preflight': 'true',
        },
      };
    } else return {};
  });

  const apolloClient = new ApolloClient({
    link: authLink.concat(cleanTypeName).concat(httpLink),
    cache: new InMemoryCache(),
    connectToDevTools: true,
  });

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};
