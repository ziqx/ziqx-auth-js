import { createRemoteJWKSet, jwtVerify } from "jose";
import { endpoints, TOKEN_ISSUER } from "./constants";
import type {
  ClientCredentials,
  GetAuthTokenParams,
  VerifyOptions,
  ZAuthOptions,
  ZAuthTokenPayload,
  ZAuthTokenResponse,
} from "./types";

/**
 * Remote key sets, one per JWKS URL. `createRemoteJWKSet` keeps an internal
 * cache of the fetched keys, so each must be created once and reused —
 * recreating it per call would refetch the JWKS every time.
 */
const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
function getJwks(url: string) {
  let jwks = keySets.get(url);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url));
    keySets.set(url, jwks);
  }
  return jwks;
}

/**
 * ZAuthTokenService - Exchanges authorization codes and verifies ZIQX tokens.
 *
 * Example:
 * ```ts
 * import { ZAuthTokenService } from "@ziqx/auth";
 *
 * const tokenService = new ZAuthTokenService();
 * const claims = await tokenService.verify(token, { appKey: "zdev_…" });
 * ```
 */
export class ZAuthTokenService {
  private urls: ReturnType<typeof endpoints>;

  /**
   * @param options.baseUrl - (Optional) Ziqx host; defaults to `https://ziqx.cc`.
   */
  constructor({ baseUrl }: ZAuthOptions = {}) {
    this.urls = endpoints(baseUrl);
  }

  /**
   * Verifies a ZIQX OAuth token **locally** using the published public key
   * (ES256), without a network round-trip per request. The public key is
   * fetched once from the JWKS endpoint and cached.
   *
   * @param token - The OAuth token to verify. A leading `"Bearer "` is allowed.
   * @param options - Pass `appKey` to assert the token was issued for your app.
   * @returns The verified token claims.
   * @throws If the token is missing, malformed, expired, has the wrong issuer/audience, or fails signature verification.
   *
   * @example
   * ```ts
   * const tokenService = new ZAuthTokenService();
   * try {
   *   const claims = await tokenService.verify(token, { appKey: "zdev_…" });
   *   console.log(claims.sub, claims.email);
   * } catch {
   *   // invalid / expired token
   * }
   * ```
   */
  async verify(
    token: string,
    options?: VerifyOptions,
  ): Promise<ZAuthTokenPayload> {
    if (!token) {
      throw new Error("ZAuthTokenService: token is required for verification.");
    }

    const jwt = token.replace(/^Bearer\s+/i, "");

    const { payload } = await jwtVerify(jwt, getJwks(this.urls.jwks), {
      algorithms: ["ES256"],
      issuer: TOKEN_ISSUER,
      // Tokens use the app key as their audience (same as `azp`).
      audience: options?.appKey ?? options?.appId,
    });

    return payload as ZAuthTokenPayload;
  }

  /**
   * Validates a token with the ZIQX Auth API.
   *
   * @deprecated Use {@link verify} instead: it checks the token locally and
   * returns its claims. The validation endpoint requires your client
   * credentials, so pass them as the second argument; without them this
   * always resolves to `false`.
   *
   * @param token - The access token (a leading `"Bearer "` is allowed).
   * @param credentials - Your app key and client secret.
   * @returns `true` if the token is valid for your app, otherwise `false`.
   */
  async validate(
    token: string,
    credentials?: ClientCredentials,
  ): Promise<boolean> {
    if (!token) {
      throw new Error("ZAuthTokenService: token is required for validation.");
    }
    if (!credentials?.appKey || !credentials.appSecret) {
      console.warn(
        "ZAuthTokenService: validate() needs { appKey, appSecret }. Prefer verify().",
      );
      return false;
    }

    try {
      const response = await fetch(this.urls.validate, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}`,
          "x-app-key": credentials.appKey,
          "x-app-secret": credentials.appSecret,
        },
      });

      if (response.status !== 200) return false;

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error("ZAuthTokenService: Validation failed:", error);
      return false;
    }
  }

  /**
   * Exchanges an authorization code for an access token. Call this on your
   * server: it sends your client secret.
   *
   * Resolves with the endpoint's JSON either way; check for `access_token`
   * (success) or `error` (failure).
   *
   * @param params.authAppKey - Your app key.
   * @param params.authSecret - Your client secret.
   * @param params.code - The `code` from the callback URL.
   * @param params.codeVerifier - The PKCE verifier you kept from `createPkce`.
   * @param params.redirectUri - The same redirect URL used to sign in.
   */
  async getAuthToken({
    authAppKey,
    authSecret,
    code,
    codeVerifier,
    redirectUri,
  }: GetAuthTokenParams): Promise<ZAuthTokenResponse> {
    if (!authAppKey || !authSecret || !code || !codeVerifier || !redirectUri) {
      throw new Error("ZAuthTokenService: All parameters are required");
    }

    const response = await fetch(this.urls.token, {
      method: "POST",
      body: JSON.stringify({
        code,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
      }),
      headers: {
        "Content-Type": "application/json",
        "x-app-key": authAppKey,
        "x-app-secret": authSecret,
      },
    });

    const data = await response.json().catch(() => null);
    return (
      data ?? {
        error: response.ok ? "server_error" : "temporarily_unavailable",
      }
    );
  }
}
