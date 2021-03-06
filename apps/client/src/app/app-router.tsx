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
import { SettingsPage } from './pages/settings/settings-page';
import { ProgramPage } from './pages/program/program-page';
import { RegisterPage } from './pages/register/register-page';
import { TeamPage } from './pages/team/team-page';
import { UserListPage } from './pages/user-list/user-list-page';
import { RegistrationsPage } from './pages/registrations/registrations-page';
import { RegistrationPage } from './pages/registration/registration-page';

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
      <Route path={appPath.registration(':id')} element={<RegistrationPage />} />
      <Route
        path={appPath.register(':id')}
        element={
          <RequireAuth>
            <RegisterPage />
          </RequireAuth>
        }
      />
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
      <Route
        path={appPath.users}
        element={
          <RequireAuth>
            <UserListPage />
          </RequireAuth>
        }
      />
      <Route
        path={appPath.registrations}
        element={
          <RequireAuth>
            <RegistrationsPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
