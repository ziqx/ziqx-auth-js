export type GetAuthTokenParams = {
  authAppKey: string;
  authSecret: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
};

/** Scopes Ziqx Auth understands. `openid` is always required. */
export type ZAuthScope = "openid" | "email" | "profile";

/** Options for {@link ZAuthClient.login} and {@link ZAuthClient.getLoginUrl}. */
export type LoginOptions = {
  /** Exact redirect URL, as added under Auth → Redirect URLs. */
  redirectUrl: string;
  /** PKCE challenge. Use {@link createPkce} for an S256 pair. */
  codeChallenge: string;
  /**
   * `"S256"` (recommended; the challenge must be the 43-character SHA-256 of
   * the verifier). When omitted the challenge is treated as a plain verifier,
   * which older integrations rely on.
   */
  codeChallengeMethod?: "S256" | "plain" | (string & {});
  /** Opaque value returned unchanged on the callback. */
  state?: string;
  /** Requested scopes. Defaults to `openid email profile`. */
  scope?: string | ZAuthScope[];
};

export type PkcePair = {
  /** Keep this secret until the callback; send it when exchanging the code. */
  verifier: string;
  /** Send this to the sign-in page. */
  challenge: string;
  method: "S256";
};

/** Successful response from the token endpoint. */
export type ZAuthTokenSuccess = {
  access_token: string;
  token_type: "Bearer";
  id_token: string;
};

/**
 * Error from the token endpoint. Apps created in Ziqx Developers return only
 * `error`; older apps also return `success: false` and a `message`.
 */
export type ZAuthTokenError = {
  error:
    | "invalid_request"
    | "invalid_client"
    | "invalid_grant"
    | "unsupported_grant_type"
    | "temporarily_unavailable"
    | "server_error"
    | (string & {});
  success?: false;
  message?: string;
};

export type ZAuthTokenResponse = ZAuthTokenSuccess | ZAuthTokenError;

/**
 * The verified claims of a ZIQX OAuth token, returned by
 * `ZAuthTokenService.verify()`.
 *
 * For apps created in Ziqx Developers, `email` is empty unless the `email`
 * scope was granted, `username`/`fullname` are empty without `profile`, and
 * `phone` is always empty.
 */
export type ZAuthTokenPayload = {
  /** Subject — the user's ZIQX open id. */
  sub: string;
  /** Authorized party — the app key the token was issued to. */
  azp: string;
  /** Audience — the app key the token was issued to (same as `azp`). */
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
   * Your app key (the public "App key" under Auth → Client credentials, e.g.
   * `zdev_…`). When provided, the token's audience must match it, ensuring
   * the token was issued for your app.
   */
  appKey?: string;
  /**
   * @deprecated Use `appKey`. Tokens carry the app **key** as their audience,
   * not the app ID, so this only passes when set to the app key.
   */
  appId?: string;
};

/** Client credentials for {@link ZAuthTokenService.validate}. */
export type ClientCredentials = {
  appKey: string;
  appSecret: string;
};

/** Options shared by {@link ZAuthClient} and {@link ZAuthTokenService}. */
export type ZAuthOptions = {
  /**
   * Ziqx host, e.g. `http://localhost:3000` for a local core-web.
   * Defaults to `https://ziqx.cc`.
   */
  baseUrl?: string;
};
