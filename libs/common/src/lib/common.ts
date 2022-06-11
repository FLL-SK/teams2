export function common(): string {
  return 'common';
}

export const appPath = {
  admin: '/admin',
  passwordReset: '/password-reset',
  login: '/login',
  logou: '/logout',
  profile: (id = '') => `/profile${id ? `/${id}` : ''}`,
  signup: '/signup',
  forgotPassword: '/forgot-password',
  team: (id = '') => `/team${id ? `/${id}` : ''}`,
  event: (id = '') => `/event${id ? `/${id}` : ''}`,
  program: (id = '') => `/program${id ? `/${id}` : ''}`,
  page404: '/404',
};
