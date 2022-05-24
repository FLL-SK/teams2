import { Navigate, useLocation } from 'react-router-dom';
import { useAuthenticate } from '../useAuthenticate';

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthenticate();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
