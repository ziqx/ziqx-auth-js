import { ZAUTH_BASE_URL } from "./constants";

/**
 * ZAuthClient - A lightweight authentication client for ZIQX Auth.
 *
 * This class facilitates redirection to the ZIQX authentication gateway.
 *
 * Example:
 * ```ts
 * import { ZAuthClient } from "@ziqx/auth";
 *
 * const auth = new ZAuthClient({
 *   authKey: "your-auth-key",
 * });
 *
 * // Redirects user to ZIQX Auth
 * auth.login({
 *  redirectUrl:"",
 * codeChallenge:"",
 * codeChallengeMethod:"",
 *  state:"",
 * });
 * ```
 */
export class ZAuthClient {
  private authKey: string;
  private codeChallengeMethod?: string;
  private state?: string;

  /**
   * Creates a new ZAuthClient instance.
   * @param options - The configuration options.
   * @param options.authKey - The authentication key provided by ZIQX.
   * @throws Will throw an error if `authKey` is missing.
   */
  constructor({ authKey }: { authKey: string }) {
    if (!authKey) {
      throw new Error(
        "ZAuthClient: Missing required parameters. `authKey` is required.",
      );
    }
    this.authKey = authKey;
  }

  /**
   * Redirects the user to the ZIQX authentication page.
   * @param options.redirectUrl - The URL where the user should be redirected after authentication.
   * @param options.codeChallenge - The code challenge for PKCE flow.
   * @param options.codeChallengeMethod - (Optional) The code challenge method (e.g., "S256"). Default is "plaintext".
   * @param options.state - (Optional) An opaque value used to maintain state between the request and the callback.
   */
  login({
    redirectUrl,
    codeChallenge,
    codeChallengeMethod,
    state,
  }: {
    redirectUrl?: string;
    codeChallenge?: string;
    codeChallengeMethod?: string;
    state?: string;
  }): void {
    const stateQuery = state ? `&state=${state}` : "";
    const codeChallengeMethodQuery = codeChallengeMethod
      ? `&challenge_method=${codeChallengeMethod}`
      : "";
    const loginUrl = `${ZAUTH_BASE_URL}?key=${this.authKey}&redir=${redirectUrl}&code_challenge=${codeChallenge}${codeChallengeMethodQuery}${stateQuery}`;

    // Redirect user to the authentication page
    window.location.href = loginUrl;
  }
}
