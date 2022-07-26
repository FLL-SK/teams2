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
  registrations: '/registrations',
  registration: (id = '') => `/registration/${id}`,
  sfShowInvoice: (id = '') => `${process.env.NX_SF_API_URL}/invoices/view/${id}`,
};

// recurrence depth limiter
type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  ...0[]
];

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number ? `${K}` | Join<K, Paths<T[K], Prev[D]>> : never;
    }[keyof T]
  : '';

type Leaves<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
  : '';

export type NestedObjectPaths<T> = Paths<T>;
// type NestedObjectPaths = "a" | "b" | "nest" | "otherNest" | "nest.c" | "otherNest.c"

export type NestedObjectLeaves<T> = Leaves<T>;
// type NestedObjectLeaves = "a" | "b" | "nest.c" | "otherNest.c"
