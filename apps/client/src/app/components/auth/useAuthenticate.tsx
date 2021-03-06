import { useContext } from 'react';
import { AuthContext } from './auth-provider';

export function useAuthenticate() {
  const context = useContext(AuthContext);
  return context;
}
