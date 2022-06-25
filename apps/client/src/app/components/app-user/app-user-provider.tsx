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
  isTeamCoach: (teamId?: string) => boolean;
  isEventManager: (eventId?: string) => boolean;
  isProgramManager: (programId?: string) => boolean;
  isAdmin: () => boolean;
  isUser: (userId: string) => boolean;
  xOut: () => string;
}

const emptyContext: AppUserContextData = {
  loading: false,
  refresh: () => Promise.reject(new Error('Not initialized')),
  isTeamCoach: () => false,
  isEventManager: () => false,
  isProgramManager: () => false,
  isAdmin: () => false,
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
  const { data, loading, error, refetch } = useGetUserQuery({ variables: { id: user?.id ?? '0' } });

  const refresh = useCallback(async (): Promise<void> => {
    if (loading) {
      return;
    }
    refetch();
  }, [loading, refetch]);

  const isUser = useCallback((userId: string): boolean => user?.id === userId, [user]);

  const isTeamCoach = useCallback(
    (teamId?: string): boolean => {
      if (teamId && data) {
        return (data?.getUser?.coachingTeams ?? []).findIndex((e) => e.id === teamId) > -1;
      }
      return false;
    },
    [data]
  );

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
        isTeamCoach,
        isEventManager,
        isProgramManager,
        isAdmin: () => data?.getUser?.isAdmin ?? false,
        isUser,
        xOut: () => 'xxx',
      }}
    >
      {children}
    </AppUserContext.Provider>
  );
}
