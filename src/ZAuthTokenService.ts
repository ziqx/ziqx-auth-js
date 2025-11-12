import { VALIDATION_URL } from "./constants";

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
      const response = await fetch(VALIDATION_URL, {
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
}
