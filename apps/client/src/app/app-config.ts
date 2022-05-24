export function getAppConfig() {
  return {
    rootApiUrl: process.env['NX_APP_AUTHAPI_URL'] ?? 'http://localhost:5000',
  };
}

export const appConfig = getAppConfig();
