import { appPath } from '@teams2/common';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthenticate } from '../useAuthenticate';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const context = useAuthenticate();
  const location = useLocation();

  if (!context.isAuthenticated) {
    return <Navigate to={appPath.login} state={{ from: location }} replace />;
  }

  return children;
}
