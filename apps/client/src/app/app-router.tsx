import React from 'react';
import { appPath } from '@teams2/common';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/auth/require-auth';
import { HomePage } from './pages/home/home-page';
import { LoginPage } from './pages/auth/login-page';
import { ForgotPasswordPage } from './pages/auth/forgot-password-page';
import { ProfilePage } from './pages/profile/profile-page';
import { ResetPasswordPage } from './pages/auth/reset-password-page';
import { SignupPage } from './pages/auth/signup-page';
import { TeamListPage } from './pages/team-list/team-list-page';
import { EventPage } from './pages/event/event-page';
import { Page404 } from './pages/404/404-page';
import { SettingsPage } from './pages/settings/admin-page';
import { ProgramPage } from './pages/program/program-page';
import { RegisterPage } from './pages/register/register-page';
import { TeamPage } from './pages/team/team-page';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path={appPath.profile(':id')}
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path={appPath.team(':id')}
        element={
          <RequireAuth>
            <TeamPage />
          </RequireAuth>
        }
      />
      <Route path={appPath.event(':id')} element={<EventPage />} />
      <Route path={appPath.program(':id')} element={<ProgramPage />} />
      <Route path={appPath.register(':id')} element={<RegisterPage />} />
      <Route path={appPath.login} element={<LoginPage />} />
      <Route path={appPath.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path={appPath.passwordReset} element={<ResetPasswordPage />} />
      <Route path={appPath.signup} element={<SignupPage />} />
      <Route path={appPath.page404} element={<Page404 />} />
      <Route
        path={appPath.settings}
        element={
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        }
      />
      <Route
        path={appPath.teams}
        element={
          <RequireAuth>
            <TeamListPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
