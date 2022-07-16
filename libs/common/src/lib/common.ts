export function common(): string {
  return 'common';
}

export const appPath = {
  settings: '/settings',
  passwordReset: '/password-reset',
  login: '/login',
  logout: '/logout',
  profile: (id = '') => `/profile/${id}`,
  register: (team = '') => `/register/${team}`,
  signup: '/signup',
  forgotPassword: '/forgot-password',
  team: (id = '') => `/team/${id}`,
  teams: '/teams',
  users: '/users',
  event: (id = '') => `/event/${id}`,
  program: (id = '') => `/program/${id}`,
  page404: '/404',
};
