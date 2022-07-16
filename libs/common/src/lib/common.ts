export function common(): string {
  return 'common';
}

export const appPath = {
  admin: '/admin',
  passwordReset: '/password-reset',
  login: '/login',
  logou: '/logout',
  profile: (id = '') => `/profile/${id}`,
  register: (team = '') => `/register/${team}`,
  signup: '/signup',
  forgotPassword: '/forgot-password',
  team: (id = '') => `/team/${id}`,
  teams: '/teams',
  event: (id = '') => `/event/${id}`,
  program: (id = '') => `/program/${id}`,
  page404: '/404',
};
