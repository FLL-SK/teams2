import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { SetContextLink } from '@apollo/client/link/context';
import omitDeep from 'omit-deep';
import React from 'react';
import { map } from 'rxjs/operators';

interface AuthedApolloProviderProps {
  children: React.ReactNode;
}

const createApolloClient = (apiUri: string, getToken: () => string | null | undefined) => {
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
    // return authorization header with the current jwt token
    const token = getToken();
    if (token) {
      return {
        headers: {
          Authorization: `Bearer ${token}`,
          'Apollo-Require-Preflight': 'true',
        },
      };
    } else return {};
  });

  return new ApolloClient({
    link: authLink.concat(cleanTypeName).concat(httpLink),
    cache: new InMemoryCache(),
  });
};

export const AuthedApolloProvider = ({
  children,
  apiUri,
  apiToken,
}: AuthedApolloProviderProps & { apiUri: string; apiToken?: string | null }) => {
  // Token is read at request time, so token changes (e.g. refreshed token after silent login)
  // do not create a new client. A new client would drop the cache and orphan running queries.
  const tokenRef = React.useRef(apiToken);
  tokenRef.current = apiToken;

  const apolloClient = React.useMemo(
    () => createApolloClient(apiUri, () => tokenRef.current),
    [apiUri],
  );

  // clear cached data on logout, so it is not visible to the next user
  const prevTokenRef = React.useRef(apiToken);
  React.useEffect(() => {
    if (prevTokenRef.current && !apiToken) {
      apolloClient.clearStore();
    }
    prevTokenRef.current = apiToken;
  }, [apiToken, apolloClient]);

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};
