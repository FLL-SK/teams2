import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuthenticate } from './use-authenticate';

export const RequireAuth = ({
  children,
  wait,
  loginUri,
}: {
  children: React.JSX.Element;
  wait: React.JSX.Element;
  loginUri: string;
}) => {
  const { isAuthenticated, isInitializing } = useAuthenticate();
  const location = useLocation();

  if (!isAuthenticated) {
    if (isInitializing) {
      return wait;
    } else {
      return <Navigate to={loginUri} state={{ from: location }} replace />;
    }
  }

  return children;
};
