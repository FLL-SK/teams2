export interface AuthUser {
  username?: string | null;
  id?: string | null;
}

/** údaje z overeného prihlasovacieho tokenu */
export interface AuthTokenInfo {
  /** čas vydania tokenu (`iat`, sekundy od epochy) */
  issuedAt: number;
  /** čas pôvodného prihlásenia heslom (`auth_time`, sekundy od epochy) – zachováva sa pri obnove */
  authTime: number;
}

export type VerifiedAuthUser = AuthUser & AuthTokenInfo;

/** účel tokenu – prihlasovací token sa nedá použiť na reset hesla a naopak */
export type TokenPurpose = 'login' | 'reset';

export interface AuthSignupData {
  username: string;
  password: string;
}

export type SecretGetterFn = () => string;

export type VerifyUserLoginFn = (username: string, password: string) => Promise<AuthUser>;

/** overí používateľa z prihlasovacieho tokenu (existencia, aktívny účet, token nie je starší ako zmena hesla) */
export type VerifyUserIdFn = (username: string, token?: AuthTokenInfo) => Promise<AuthUser>;

export type LoginOkFn = (user: AuthUser) => Promise<void>;
