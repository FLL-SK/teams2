import type { IncomingMessage } from 'node:http';
import morgan from 'morgan';

/**
 * Cesta požiadavky bez query stringu – query môže obsahovať tokeny (`/auth?token=…`)
 * alebo tajné kľúče (`/payment-cb?secret_key=…`), ktoré nesmú skončiť v logoch. #282
 */
export function urlWithoutQuery(url: string | undefined): string {
  if (!url) {
    return '-';
  }
  const i = url.indexOf('?');
  return i < 0 ? url : url.slice(0, i);
}

morgan.token('url-path', (req: IncomingMessage & { originalUrl?: string }) =>
  urlWithoutQuery(req.originalUrl ?? req.url),
);

/** ako morgan formát `tiny`, ale bez query stringu */
export const REQUEST_LOG_FORMAT = ':method :url-path :status :res[content-length] - :response-time ms';

export function requestLogger() {
  return morgan(REQUEST_LOG_FORMAT);
}
