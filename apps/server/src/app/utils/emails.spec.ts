const { sendEmail, msgFromTemplate } = vi.hoisted(() => ({
  sendEmail: vi.fn(async () => undefined),
  msgFromTemplate: vi.fn(async (_title: string, text: string) => text),
}));
vi.mock('./mailer', () => ({ sendEmail }));
vi.mock('./messages', () => ({ msgFromTemplate, msgPasswordReset: vi.fn() }));

import { emailEventChangedToCoach, emailMessage } from './emails';

const flush = () => new Promise((r) => setTimeout(r, 10));

describe('e-maily (#285)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('emailEventChangedToCoach obsahuje úvod, zmenu aj odkaz na turnaj', async () => {
    emailEventChangedToCoach({
      emails: ['coach@example.com'],
      eventName: 'Turnaj BA',
      programName: 'FLL',
      teamName: 'Tím 1',
      eventUrl: 'https://tms.example.com/event/1',
      change: 'Zmena dátumu',
    });
    await flush();
    const text = msgFromTemplate.mock.calls[0][1];
    expect(text).toContain('Turnaj Turnaj BA programu FLL, na ktorý je váš tím Tím 1 registrovaný');
    expect(text).toContain('\nZmena dátumu');
    expect(text).toContain('https://tms.example.com/event/1');
  });

  it('emailEventChangedToCoach bez textu zmeny obsahuje úvod a odkaz', async () => {
    emailEventChangedToCoach({
      emails: ['coach@example.com'],
      eventName: 'Turnaj BA',
      programName: 'FLL',
      teamName: 'Tím 1',
      eventUrl: 'https://tms.example.com/event/1',
    });
    await flush();
    const text = msgFromTemplate.mock.calls[0][1];
    expect(text).toContain('Turnaj Turnaj BA');
    expect(text).toContain('https://tms.example.com/event/1');
  });

  it('chyba šablóny alebo odoslania sa iba zaloguje (žiadny unhandled rejection)', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    try {
      msgFromTemplate.mockRejectedValueOnce(new Error('chýbajú nastavenia'));
      emailMessage({ to: 'a@example.com', subject: 's', title: 't', text: 'x' });
      sendEmail.mockRejectedValueOnce(new Error('SES'));
      emailMessage({ to: 'a@example.com', subject: 's', title: 't', text: 'x' });
      await flush();
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });
});
