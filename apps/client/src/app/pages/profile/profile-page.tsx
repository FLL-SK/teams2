import { useAuth0 } from '@auth0/auth0-react';
import { useGetProfileQuery } from '../../generated/graphql';

export function ProfilePage() {
  const { user, logout } = useAuth0();
  const { data, loading, error } = useGetProfileQuery({ variables: { username: user?.email } });

  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>Profile Page</h1>
      <p>This is the profile page.</p>
      <p>{data?.getProfile?.name}</p>
      <p>{data?.getProfile?.username}</p>
      <button
        onClick={() => {
          logout({ returnTo: window.location.origin });
        }}
      >
        Log out
      </button>
    </div>
  );
}
