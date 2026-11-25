import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EditColorDialog } from './edit-color-dialog';

// Grommet Layer (portál, animácie) netreba – stačí obsah modálneho okna
vi.mock('../modal', () => ({
  Modal: ({ title, children }: { title?: string; children: React.ReactNode }) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

describe('EditColorDialog', () => {
  it('zobrazí výber farby s aktuálnou farbou', () => {
    render(<EditColorDialog color="#ff0000" onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Vybrať farbu' })).toBeTruthy();
    expect((screen.getByLabelText('Farba') as HTMLInputElement).value).toBe('#ff0000');
    // HexColorPicker z react-colorful
    expect(screen.getByRole('slider', { name: 'Color' })).toBeTruthy();
  });

  it('pri uložení odošle zmenenú farbu a zavrie dialóg', async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(<EditColorDialog color="#ffffff" onClose={onClose} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Farba'), { target: { value: '#00ff00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Uložiť' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSubmit).toHaveBeenCalledWith('#00ff00');
  });

  it('nezobrazí nič, keď show=false', () => {
    const { container } = render(
      <EditColorDialog show={false} onClose={vi.fn()} onSubmit={vi.fn()} />,
    );
    expect(container.innerHTML).toBe('');
  });
});
