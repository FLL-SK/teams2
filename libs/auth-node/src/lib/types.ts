export interface AuthUser {
  username?: string | null;
  id?: string | null;
}

export type SecretGetterFn = () => string;

export type VerifyUserLoginFn = (username: string, password: string) => Promise<AuthUser>;

export type VerifyUserIdFn = (username: string) => Promise<AuthUser>;

export type LoginOkFn = (user: AuthUser) => Promise<void>;
