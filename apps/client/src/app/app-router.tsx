import { appPath } from '@teams2/common';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/auth/require-auth';
import { useAuthenticate } from './components/useAuthenticate';
import { useGetUserLazyQuery } from './generated/graphql';
import { HomePage } from './pages/home/home-page';
import { LoginPage } from './pages/auth/login-page';
import { ForgotPasswordPage } from './pages/auth/forgot-password-page';
import { ProfilePage } from './pages/profile/profile-page';
import { ResetPasswordPage } from './pages/auth/reset-password-page';
import { SignupPage } from './pages/auth/signup-page';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path={appPath.profile}
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route path={appPath.login} element={<LoginPage />} />
      <Route path={appPath.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path={appPath.passwordReset} element={<ResetPasswordPage />} />
      <Route path={appPath.signup} element={<SignupPage />} />
    </Routes>
  );
}
