import { ApolloError } from '@apollo/client';
import React, { createContext, useCallback, useEffect } from 'react';
import { useGetUserQuery, UserFragmentFragment } from '../../generated/graphql';
import { useAuthenticate } from '../auth/useAuthenticate';

type AppUser = UserFragmentFragment;

export interface AppUserContextData {
  loading: boolean;
  user?: AppUser;
  error?: ApolloError;
  refresh: () => Promise<void>;
  isEventManager: (eventId?: string) => boolean;
  isProgramManager: (programId?: string) => boolean;
  isAdmin: () => boolean;
}

const emptyContext: AppUserContextData = {
  loading: false,
  refresh: () => Promise.reject(new Error('Not initialized')),
  isEventManager: () => false,
  isProgramManager: () => false,
  isAdmin: () => false,
};

export const AppUserContext = createContext<AppUserContextData>(emptyContext);

interface AppUserContextProviderProps {
  children?: React.ReactNode;
}

export function AppUserContextProvider(props: AppUserContextProviderProps) {
  const { children } = props;
  const { user } = useAuthenticate();
  const { data, loading, error, refetch } = useGetUserQuery({ variables: { id: user?.id ?? '0' } });

  const refresh = useCallback(async (): Promise<void> => {
    if (loading) {
      return;
    }
    refetch();
  }, [loading, refetch]);

  const isEventManager = useCallback(
    (eventId?: string): boolean => {
      if (eventId && data) {
        return (data?.getUser?.managingEvents ?? []).findIndex((e) => e.id === eventId) > -1;
      }
      return false;
    },
    [data]
  );

  const isProgramManager = useCallback(
    (programId?: string): boolean => {
      if (programId && data) {
        return (data?.getUser?.managingPrograms ?? []).findIndex((p) => p.id === programId) > -1;
      }
      return false;
    },
    [data]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AppUserContext.Provider
      value={{
        user: data?.getUser ?? undefined,
        loading,
        error,
        refresh,
        isEventManager,
        isProgramManager,
        isAdmin: () => data?.getUser?.isAdmin ?? false,
      }}
    >
      {children}
    </AppUserContext.Provider>
  );
}
