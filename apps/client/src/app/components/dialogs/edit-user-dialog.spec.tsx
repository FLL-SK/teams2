import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EditUserDialog } from './edit-user-dialog';

const { isAdmin } = vi.hoisted(() => ({ isAdmin: vi.fn(() => true) }));
vi.mock('../app-user/use-app-user', () => ({ useAppUser: () => ({ isAdmin }) }));
vi.mock('@apollo/client/react', () => ({ useQuery: () => ({ data: undefined }) }));
vi.mock('../modal', () => ({
  Modal: ({ title, children }: { title?: string; children: React.ReactNode }) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

const user = {
  firstName: 'Ján',
  lastName: 'Tréner',
  username: 'jan@example.com',
  phone: '0900123456',
};

// Regresia #294: usernameOverride sa počítal porovnaním booleanu s e-mailom – vždy pravda
describe('EditUserDialog', () => {
  it('admin bez zmeny e-mailu neodošle usernameOverride', async () => {
    const onSubmit = vi.fn(async () => undefined);
    const onClose = vi.fn();
    render(<EditUserDialog user={user} onClose={onClose} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Uložiť' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'jan@example.com', usernameOverride: false }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
