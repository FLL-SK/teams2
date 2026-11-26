const { getAppSettings } = vi.hoisted(() => ({ getAppSettings: vi.fn() }));
vi.mock('./settings', () => ({ getAppSettings }));

import { msgFromTemplate, msgPasswordReset } from './messages';
import { escapeHtml, safeUrl } from './escape-html';

describe('escapovanie HTML v e-mailoch (#284)', () => {
  beforeEach(() => {
    getAppSettings.mockResolvedValue({
      appLogoUrl: 'https://tms.example.com/logo.png',
      organization: { name: 'FLL <SK>', street: 'Ulica', city: 'BA', zip: '81101' },
    });
  });

  it('escapeHtml a safeUrl', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
    expect(escapeHtml(undefined)).toBe('');
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('nie je url')).toBe('');
    expect(safeUrl('https://a.example.com/x?a=1&b=2')).toBe('https://a.example.com/x?a=1&amp;b=2');
  });

  it('text e-mailu (napr. názov tímu) nevloží HTML ani odkaz', async () => {
    const html = await msgFromTemplate(
      'Tím <b>X</b>',
      'Tím <a href="https://zly.example.com">klikni</a>\ndruhý riadok',
    );
    expect(html).not.toContain('<a href="https://zly.example.com">');
    expect(html).toContain(
      '&lt;a href=&quot;https://zly.example.com&quot;&gt;klikni&lt;/a&gt;<br/>druhý riadok',
    );
    expect(html).toContain('<h3>Tím &lt;b&gt;X&lt;/b&gt;</h3>');
    expect(html).toContain('<h2>FLL &lt;SK&gt;</h2>');
    expect(html).toContain('<img src="https://tms.example.com/logo.png"');
  });

  it('logo s nepovolenou URL sa vynechá', async () => {
    getAppSettings.mockResolvedValue({
      appLogoUrl: 'javascript:alert(1)',
      organization: { name: 'Org', street: '', city: '', zip: '' },
    });
    expect(await msgFromTemplate('t', 'm')).not.toContain('<img');
  });

  it('reset hesla escapuje e-mail a odkaz', async () => {
    const html = await msgPasswordReset('a"><script>@example.com', 'tok');
    expect(html).not.toContain('<script>');
    expect(html).toMatch(/<a href="[^"]+token=tok">/);
  });
});
