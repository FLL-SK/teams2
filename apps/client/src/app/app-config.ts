export function getAppConfig() {
  return {
    rootApiUrl: process.env['NX_API_URL'] ?? 'http://localhost:5000',
  };
}

export const appConfig = getAppConfig();
