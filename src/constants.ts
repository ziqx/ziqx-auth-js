/** Ziqx sign-in host. Override with `baseUrl` to use a local core-web. */
export const DEFAULT_BASE_URL = "https://ziqx.cc";

export const ZAUTH_BASE_URL = `${DEFAULT_BASE_URL}/zauth`;
export const VALIDATION_URL = `${DEFAULT_BASE_URL}/api/auth/validate-token`;
export const TOKEN_URL = `${DEFAULT_BASE_URL}/zauth/token`;
export const VALIDATION_URL_V2 = `${DEFAULT_BASE_URL}/zauth/validate`;

/** JWKS endpoint exposing the public key used to sign ZIQX OAuth tokens (ES256). */
export const JWKS_URL = `${DEFAULT_BASE_URL}/zauth/jwks.json`;
/** Expected `iss` claim on ZIQX OAuth tokens (the same on every host). */
export const TOKEN_ISSUER = "ziqx.cc";

/** Endpoints for one Ziqx host. */
export function endpoints(baseUrl: string = DEFAULT_BASE_URL) {
  const base = new URL(baseUrl).origin;
  return {
    authorize: `${base}/zauth`,
    token: `${base}/zauth/token`,
    validate: `${base}/zauth/validate`,
    jwks: `${base}/zauth/jwks.json`,
  };
}
