import { render } from '@testing-library/react';
import { Markdown } from 'grommet';
import { MD, SAFE_MARKDOWN_OPTIONS } from './md';

// #284 – markdown od používateľov (podmienky turnaja, poznámky) nesmie vložiť HTML ani skript
describe('MD – bezpečný markdown', () => {
  it('raw HTML sa nevyrenderuje ako element', () => {
    const { container } = render(
      <MD>{'Text <img src="x" onerror="alert(1)"> a <script>alert(1)</script> **tučne**'}</MD>,
    );
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('strong')?.textContent).toBe('tučne');
  });

  it('odkaz s javascript: URL nemá nebezpečný href, bežný odkaz sa otvorí v novom okne', () => {
    const { container } = render(
      <MD>{'[zlý](javascript:alert(1)) a [dobrý](https://example.com)'}</MD>,
    );
    const links = [...container.querySelectorAll('a')];
    expect(links.some((a) => (a.getAttribute('href') ?? '').startsWith('javascript:'))).toBe(false);
    const good = links.find((a) => a.textContent === 'dobrý');
    expect(good?.getAttribute('href')).toBe('https://example.com');
    expect(good?.getAttribute('target')).toBe('_blank');
  });

  it('Grommet Markdown s SAFE_MARKDOWN_OPTIONS tiež nerenderuje raw HTML', () => {
    const { container } = render(
      <Markdown options={SAFE_MARKDOWN_OPTIONS}>
        {'<iframe src="https://x"></iframe> text'}
      </Markdown>,
    );
    expect(container.querySelector('iframe')).toBeNull();
  });
});
