import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface Auth0WrapperProps {
  children: React.ReactNode;
}

export function Auth0Wrapper({ children }:Auth0WrapperProps) {
  const { isLoading, error, isAuthenticated, user } = useAuth0();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }
  console.log(isAuthenticated, user);
  return (<>{children}</>);
}