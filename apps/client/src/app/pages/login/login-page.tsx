import { useLocation, useNavigate } from 'react-router-dom';
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

  return <button onClick={() => handleLogin('admin@test', 'admin')}>Log In</button>;
}
