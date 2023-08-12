import { ApolloError } from '@apollo/client';
import React, { createContext, useCallback, useEffect } from 'react';
import { useGetUserLazyQuery, UserFragmentFragment } from '../../generated/graphql';
import { useAuthenticate } from '@teams2/auth-react';

type AppUser = UserFragmentFragment;

export interface AppUserContextData {
  userLoading: boolean;
  user?: AppUser;
  userError?: ApolloError;
  refresh: () => Promise<void>;
  isTeamCoach: (teamId?: string) => boolean;
  isEventManager: (eventId?: string) => boolean;
  isProgramManager: (programId?: string) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isUser: (userId: string) => boolean;
  xOut: () => string;
}

const emptyContext: AppUserContextData = {
  userLoading: false,
  refresh: () => Promise.reject(new Error('Not initialized')),
  isTeamCoach: () => false,
  isEventManager: () => false,
  isProgramManager: () => false,
  isAdmin: () => false,
  isSuperAdmin: () => false,
  isUser: () => false,
  xOut: () => 'xxx',
};

export const AppUserContext = createContext<AppUserContextData>(emptyContext);

interface AppUserContextProviderProps {
  children?: React.ReactNode;
}

export function AppUserContextProvider(props: AppUserContextProviderProps) {
  const { children } = props;
  const { user } = useAuthenticate();
  const [fetchCount, setFetchCount] = React.useState(0);

  const [fetchUser, { data, loading: userLoading, error: userError }] = useGetUserLazyQuery({
    fetchPolicy: 'network-only',
  });

  const incrementError = useCallback(() => {
    setFetchCount(fetchCount + 1);
    if (fetchCount >= 2) {
      setTimeout(() => {
        setFetchCount(0);
      }, 10000);
    }
  }, [fetchCount]);

  useEffect(() => {
    if (user && user.id && fetchCount < 3) {
      fetchUser({ variables: { id: user.id } })
        .catch((err) => {
          incrementError();
        })
        .then(() => {
          if (userError) {
            incrementError();
          } else {
            setFetchCount(0);
          }
        });
    }
  }, [user, fetchUser, fetchCount, userError, incrementError]);

  const refresh = useCallback(async (): Promise<void> => {
    if (!userLoading && user && user.id && fetchCount < 3) {
      fetchUser({ variables: { id: user.id } })
        .then(() => {
          if (userError) {
            incrementError();
          } else {
            setFetchCount(0);
          }
        })
        .catch((err) => {
          incrementError();
        });
    }
  }, [userLoading, user, fetchCount, fetchUser, userError, incrementError]);

  const isUser = useCallback(
    (userId: string): boolean => (user ? user.id === userId : false),
    [user],
  );

  const isTeamCoach = useCallback(
    (teamId?: string): boolean => {
      if (teamId && data) {
        return (data?.getUser?.coachingTeams ?? []).findIndex((e) => e.id === teamId) > -1;
      }
      return false;
    },
    [data],
  );

  const isEventManager = useCallback(
    (eventId?: string): boolean => {
      if (eventId && data) {
        return (data?.getUser?.managingEvents ?? []).findIndex((e) => e.id === eventId) > -1;
      }
      return false;
    },
    [data],
  );

  const isProgramManager = useCallback(
    (programId?: string): boolean => {
      if (programId && data) {
        return (data?.getUser?.managingPrograms ?? []).findIndex((p) => p.id === programId) > -1;
      }
      return false;
    },
    [data],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AppUserContext.Provider
      value={{
        user: data?.getUser ?? undefined,
        userLoading,
        userError,
        refresh,
        isTeamCoach,
        isEventManager,
        isProgramManager,
        isAdmin: () => data?.getUser?.isAdmin ?? false,
        isSuperAdmin: () => data?.getUser?.isSuperAdmin ?? false,
        isUser,
        xOut: () => 'xxx',
      }}
    >
      {children}
    </AppUserContext.Provider>
  );
}
