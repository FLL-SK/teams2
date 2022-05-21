import { ApolloClient, ApolloLink, ApolloProvider, createHttpLink, InMemoryCache } from '@apollo/client';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import omitDeep from 'omit-deep';
import { setContext } from '@apollo/link-context';
import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { appConfig } from '../../app-config';

interface AuthedApolloProviderProps {
  children: React.ReactNode;
}

export function AuthedApolloProvider({ children }: AuthedApolloProviderProps) {
  const { getAccessTokenSilently } = useAuth0();

  const httpLink = createHttpLink({
    uri: appConfig.graphQLUrl // your URI here...
  });

  // cleans __typename from the input data
  // SEE: https://stackoverflow.com/questions/47211778/cleaning-unwanted-fields-from-graphql-responses/51380645#51380645
  const cleanTypeName = new ApolloLink((operation, forward) => {
    if (operation.variables) {
      operation.variables = omitDeep(operation.variables, '__typename');
    }
    return forward(operation).map((data) => {
      return data;
    });
  });

  const authLink = setContext(async () => {
    const token = await getAccessTokenSilently();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  });

  const apolloClient = new ApolloClient({
    link: authLink.concat(cleanTypeName).concat(httpLink),
    cache: new InMemoryCache(),
    connectToDevTools: true
  });

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
