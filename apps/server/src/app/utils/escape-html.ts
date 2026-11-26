const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** escapuje text pre vloženie do HTML (obsah aj hodnota atribútu v úvodzovkách) – #284 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/** URL pre atribút `src`/`href` – iba http(s), inak prázdny reťazec */
export function safeUrl(value: unknown): string {
  try {
    const u = new URL(String(value ?? ''));
    return u.protocol === 'https:' || u.protocol === 'http:' ? escapeHtml(u.toString()) : '';
  } catch {
    return '';
  }
}
