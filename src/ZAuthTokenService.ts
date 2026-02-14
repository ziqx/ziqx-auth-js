import { TOKEN_URL, VALIDATION_URL, VALIDATION_URL_V2 } from "./constants";
import { GetAuthTokenParams } from "./types";

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
   * Validates a given authentication token with the ZIQX Auth API.
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
