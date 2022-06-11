import { appPath } from '@teams2/common';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/auth/require-auth';
import { HomePage } from './pages/home/home-page';
import { LoginPage } from './pages/auth/login-page';
import { ForgotPasswordPage } from './pages/auth/forgot-password-page';
import { ProfilePage } from './pages/profile/profile-page';
import { ResetPasswordPage } from './pages/auth/reset-password-page';
import { SignupPage } from './pages/auth/signup-page';
import { TeamPage } from './pages/team/team-page';
import { EventPage } from './pages/event/event-page';
import { Page404 } from './pages/404/404-page';
import { AdminPage } from './pages/admin/admin-page';
import { ProgramPage } from './pages/program/program-page';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path={`${appPath.profile()}/:id`}
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path={`${appPath.team()}/:id`}
        element={
          <RequireAuth>
            <TeamPage />
          </RequireAuth>
        }
      />
      <Route path={`${appPath.event()}/:id`} element={<EventPage />} />
      <Route path={`${appPath.program()}/:id`} element={<ProgramPage />} />
      <Route path={appPath.login} element={<LoginPage />} />
      <Route path={appPath.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path={appPath.passwordReset} element={<ResetPasswordPage />} />
      <Route path={appPath.signup} element={<SignupPage />} />
      <Route path={appPath.page404} element={<Page404 />} />
      <Route
        path={appPath.admin}
        element={
          <RequireAuth>
            <AdminPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
