import { fireAndForget } from './fire-and-forget';

describe('fireAndForget (#285)', () => {
  it('zamietnutý Promise neskončí ako unhandled rejection', async () => {
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    try {
      fireAndForget(Promise.reject(new Error('SES nedostupné')), 'test');
      await new Promise((r) => setTimeout(r, 10));
      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', unhandled);
    }
  });
});
