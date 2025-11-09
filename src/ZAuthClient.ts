import { ZAUTH_BASE_URL } from "./constants";

/**
 * ZAuthClient - A lightweight authentication client for ZIQX Auth.
 *
 * This class helps redirect users to the ZIQX authentication gateway.
 *
 * Example:
 * ```ts
 * import { ZAuthClient } from "@ziqx/auth";
 *
 * const auth = new ZAuthClient({
 *   authKey: "your-auth-key"
 * });
 *
 * // Redirects user to ZIQX Auth
 * auth.login();
 *
 * // For development mode
 * auth.login(true);
 * ```
 */
export class ZAuthClient {
  private authKey: string;

  /**
   * Creates a new ZAuthClient instance.
   *
   * @param options - The configuration options.
   * @param options.authKey - The authentication key provided by ZIQX.
   */
  constructor({ authKey }: { authKey: string }) {
    if (!authKey) {
      throw new Error("ZAuthClient: authKey is required.");
    }
    this.authKey = authKey;
  }

  /**
   * Redirects the user to the ZIQX authentication page.
   *
   * @param isDev - (Optional) Set to `true` to use development mode. Defaults to `false`.
   *
   * @example
   * ```ts
   * const client = new ZAuthClient({ authKey: "your-auth-key" });
   * client.login(); // Redirects to production auth page
   * client.login(true); // Redirects to development auth page
   * ```
   */
  login(isDev: boolean = false): void {
    const devQuery = isDev ? "&dev=true" : "";
    const loginUrl = `${ZAUTH_BASE_URL}?key=${this.authKey}${devQuery}`;

    // Redirect user to the authentication page
    window.location.href = loginUrl;
  }
}
