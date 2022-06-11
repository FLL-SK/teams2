import { useContext } from 'react';
import { AppUserContext } from './app-user-provider';

export function useAppUser() {
  const context = useContext(AppUserContext);
  return context;
}
