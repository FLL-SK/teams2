import { useAuthenticate } from '../../components/useAuthenticate';
import { useGetProfileQuery } from '../../generated/graphql';

export function ProfilePage() {
  const { user, logout } = useAuthenticate();
  const { data, loading, error } = useGetProfileQuery({ variables: { username: user?.username } });

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
          logout();
        }}
      >
        Log out
      </button>
    </div>
  );
}
