import React from 'react';
import { appPath } from '@teams2/common';
import { Route, Routes } from 'react-router-dom';
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
import { EventsPage } from './pages/events/events-page';
import { ProgramsPage } from './pages/programs/programs-page';
import { RequireAuth } from '@teams2/auth-react';

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth wait={<div>Loading...</div>} loginUri={appPath.login}>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path={appPath.profile(':id')}
        element={
<RequireAuth wait={<div>Loading...</div>} loginUri={appPath.login}>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path={appPath.team(':id')}
        element={
          <RequireAuth wait={<div>Loading...</div>} loginUri={appPath.login}>
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
          <RequireAuth wait={<div>Loading...</div>} loginUri={appPath.login}>
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
          <RequireAuth wait={<div>Loading...</div>} loginUri={appPath.login}>
            <SettingsPage />
          </RequireAuth>
        }
      />
      <Route
        path={appPath.teams}
        element={
          <RequireAuth wait={<div>Loading...</div>} loginUri={appPath.login}>
            <TeamListPage />
          </RequireAuth>
        }
      />
      <Route
        path={appPath.users}
        element={
          <RequireAuth wait={<div>Loading...</div>} loginUri={appPath.login}>
            <UserListPage />
          </RequireAuth>
        }
      />
      <Route
        path={appPath.registrations}
        element={
          <RequireAuth wait={<div>Loading...</div>} loginUri={appPath.login}>
            <RegistrationsPage />
          </RequireAuth>
        }
      />
      <Route
        path={appPath.events}
        element={
          <RequireAuth wait={<div>Loading...</div>} loginUri={appPath.login}>
            <EventsPage />
          </RequireAuth>
        }
      />
      <Route
        path={appPath.programs}
        element={
          <RequireAuth wait={<div>Loading...</div>} loginUri={appPath.login}>
            <ProgramsPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
