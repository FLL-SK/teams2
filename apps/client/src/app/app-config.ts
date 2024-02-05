declare global {
  interface Window {
    APP_API_URL?: string | null;
    APP_SF_API_URL?: string | null;
  }
}

export const getAppConfig = () => {
  const config = {
    apiUrl: window.APP_API_URL ?? 'http://localhost:5000',
    sfAPIUrl: window.APP_SF_API_URL ?? 'http://localhost:3000',
  };

  return config;
};

export const appConfig = getAppConfig();
