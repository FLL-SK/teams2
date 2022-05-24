import React, { useEffect } from 'react';
import { useAuthenticate } from '../useAuthenticate';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isChecking, setIsChecking] = React.useState(true);
  const { error, silentCheck } = useAuthenticate();

  useEffect(() => {
    silentCheck().then((r) => {
      setIsChecking(false);
    });
  }, [silentCheck, setIsChecking]);

  if (isChecking) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  return <>{children}</>;
}
