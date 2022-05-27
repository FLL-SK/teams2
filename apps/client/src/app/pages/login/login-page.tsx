import { useLocation, useNavigate } from 'react-router-dom';
import { BasePage } from '../../components/base-page';
import { useAuthenticate } from '../../components/useAuthenticate';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthenticate();

  const handleLogin = async (username: string, password: string) => {
    if ((await login(username, password)).user) {
      navigate((location.state as { from?: string })?.from || '/');
      return;
    }
  };

  return (
    <BasePage>
      <button onClick={() => handleLogin('admin@test', 'admin')}>Log In</button>;
    </BasePage>
  );
}
