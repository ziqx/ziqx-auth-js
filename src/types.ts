export type GetAuthTokenParams = {
  authAppKey: string;
  authSecret: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
};

/**
 * The verified claims of a ZIQX OAuth token, returned by
 * `ZAuthTokenService.verify()`.
 */
export type ZAuthTokenPayload = {
  /** Subject — the user's ZIQX open id. */
  sub: string;
  /** Authorized party — the app key the token was issued to. */
  azp: string;
  /** Audience — the app id the token is intended for. */
  aud: string | string[];
  /** Issuer — always `ziqx.cc`. */
  iss: string;
  /** Issued-at (seconds since epoch). */
  iat: number;
  /** Expiry (seconds since epoch). */
  exp: number;
  username: string;
  email: string;
  phone: string;
  fullname: string;
  [claim: string]: unknown;
};

/** Options for {@link ZAuthTokenService.verify}. */
export type VerifyOptions = {
  /**
   * Your app id. When provided, the token's `aud` claim must match it,
   * ensuring the token was issued for your application.
   */
  appId?: string;
};
