import { createRemoteJWKSet, jwtVerify } from "jose";
import {
  JWKS_URL,
  TOKEN_ISSUER,
  TOKEN_URL,
  VALIDATION_URL,
  VALIDATION_URL_V2,
} from "./constants";
import {
  GetAuthTokenParams,
  VerifyOptions,
  ZAuthTokenPayload,
} from "./types";

/**
 * Lazily-created, cached remote key set. `createRemoteJWKSet` keeps an internal
 * cache of the fetched keys, so it must be created once and reused — recreating
 * it per call would refetch the JWKS every time.
 */
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(JWKS_URL));
  }
  return jwks;
}

/**
 * ZAuthTokenService - A simple token validation service for ZIQX Auth.
 *
 * This class provides a method to validate authentication tokens issued by ZIQX.
 *
 * Example:
 * ```ts
 * import { ZAuthTokenService } from "@ziqx/auth";
 *
 * const tokenService = new ZAuthTokenService();
 * const isValid = await tokenService.validate("your-jwt-token");
 *
 * if (isValid) {
 *   console.log("Token is valid");
 * } else {
 *   console.log("Invalid or expired token");
 * }
 * ```
 */
export class ZAuthTokenService {
  /**
   * Verifies a ZIQX OAuth token **locally** using the published public key
   * (ES256), without a network round-trip per request. The public key is
   * fetched once from the JWKS endpoint and cached.
   *
   * This is the recommended replacement for {@link validate}: it is faster,
   * works offline after the first key fetch, and cannot be tricked by a
   * compromised network path since the signature is checked cryptographically.
   *
   * @param token - The OAuth token to verify. A leading `"Bearer "` is allowed.
   * @param options - See {@link VerifyOptions}. Pass `appId` to assert the token's audience.
   * @returns The verified token claims.
   * @throws If the token is missing, malformed, expired, has the wrong issuer/audience, or fails signature verification.
   *
   * @example
   * ```ts
   * const tokenService = new ZAuthTokenService();
   * try {
   *   const claims = await tokenService.verify(token, { appId: "your-app-id" });
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

    const { payload } = await jwtVerify(jwt, getJwks(), {
      issuer: TOKEN_ISSUER,
      audience: options?.appId,
    });

    return payload as ZAuthTokenPayload;
  }

  /**
   * Validates a given authentication token with the ZIQX Auth API.
   *
   * @deprecated Use {@link verify} instead. `validate` makes a network call to
   * the ZIQX validation endpoint on every request; `verify` checks the token
   * locally against the public key and returns the decoded claims. This method
   * remains for backward compatibility and will be removed in a future release.
   *
   * @param token - The authentication token (JWT or similar) to validate.
   * @returns A Promise that resolves to `true` if the token is valid, otherwise `false`.
   *
   * @example
   * ```ts
   * const tokenService = new ZAuthTokenService();
   * const isValid = await tokenService.validate("your-jwt-token");
   * ```
   */
  async validate(token: string): Promise<boolean> {
    if (!token) {
      throw new Error("ZAuthTokenService: token is required for validation.");
    }

    try {
      const response = await fetch(VALIDATION_URL_V2, {
        method: "GET",
        headers: {
          Authorization: token,
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
   * Exchanges an authorization code for an access token.
   *
   * @param params - The parameters required to exchange the code for a token.
   * @param params.authAppKey - The application key.
   * @param params.authSecret - The application secret.
   * @param params.code - The authorization code received from the callback.
   * @param params.codeVerifier - The code verifier used in PKCE.
   * @param params.redirectUri - The redirect URI used in the initial request.
   * @returns A Promise that resolves to the token response data.
   */
  async getAuthToken({
    authAppKey,
    authSecret,
    code,
    codeVerifier,
    redirectUri,
  }: GetAuthTokenParams): Promise<any> {
    if (!authAppKey || !authSecret || !code || !codeVerifier || !redirectUri) {
      throw new Error("ZAuthTokenService: All parameters are required");
    }

    const response = await fetch(TOKEN_URL, {
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

    const data = await response.json();
    return data;
  }
}
