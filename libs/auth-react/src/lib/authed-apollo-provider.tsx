import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { SetContextLink } from '@apollo/client/link/context';
import omitDeep from 'omit-deep';
import React from 'react';
import { map } from 'rxjs/operators';

interface AuthedApolloProviderProps {
  children: React.ReactNode;
}

export const AuthedApolloProvider = ({
  children,
  apiUri,
  apiToken,
}: AuthedApolloProviderProps & { apiUri: string; apiToken?: string | null }) => {
  const httpLink = new HttpLink({ uri: apiUri });

  // cleans __typename from the input data
  // SEE: https://stackoverflow.com/questions/47211778/cleaning-unwanted-fields-from-graphql-responses/51380645#51380645
  const cleanTypeName = new ApolloLink((operation, forward) => {
    if (operation.variables) {
      operation.variables = omitDeep(operation.variables, ['__typename']);
    }
    return forward(operation).pipe(map((data) => data));
  });

  const authLink = new SetContextLink(() => {
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
  });

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};
