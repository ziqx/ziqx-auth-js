export type GetAuthTokenParams = {
  authAppKey: string;
  authSecret: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
};
