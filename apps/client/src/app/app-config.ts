declare global {
  interface Window {
    NX_API_URL?: string | null;
    NX_SF_API_URL?: string | null;
  }
}

export const getAppConfig = () => {
  const config = {
    apiUrl: window.NX_API_URL ?? 'http://localhost:5000',
    sfAPIUrl: window.NX_SF_API_URL ?? 'http://localhost:3000',
  };

  return config;
};

export const appConfig = getAppConfig();
