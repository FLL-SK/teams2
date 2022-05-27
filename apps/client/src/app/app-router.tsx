import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/auth/require-auth';
import { HomePage } from './pages/home/home-page';
import { LoginPage } from './pages/login/login-page';
import { ProfilePage } from './pages/profile/profile-page';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
