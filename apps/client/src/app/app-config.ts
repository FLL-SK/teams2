export function getAppConfig() {
  return {
    rootApiUrl: process.env.NX_API_URL ?? 'http://localhost:5000',
    sfAPIUrl: process.env.NX_SF_API_URL ?? 'http://localhost:3000',
  };
}

export const appConfig = getAppConfig();
