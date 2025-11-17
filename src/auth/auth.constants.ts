export const AUTH_OPTIONS = 'AUTH_OPTIONS';

export interface AuthModuleOptions {
  secret: string;
  tokenPrefix?: string;
}
