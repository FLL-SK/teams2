import React from 'react';
import { appPath } from '@teams2/common';
import { Spinner } from 'grommet';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthenticate } from './useAuthenticate';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isInitializing } = useAuthenticate();
  const location = useLocation();

  if (!isAuthenticated) {
    if (isInitializing) {
      return <Spinner />;
    } else {
      return <Navigate to={appPath.login} state={{ from: location }} replace />;
    }
  }

  return children;
}
