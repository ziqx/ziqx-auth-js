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
 *   redirectUrl: "http://localhost:3000/callback",
 *   codeChallenge: "your-code-challenge"
 * });
 *
 * // Redirects user to ZIQX Auth
 * auth.login();
 *
 * // For development mode (redirects to localhost)
 * auth.login(true);
 * ```
 */
export class ZAuthClient {
  private authKey: string;
  private redirectUrl: string;
  private codeChallenge: string;
  private codeChallengeMethod?: string;
  private state?: string;

  /**
   * Creates a new ZAuthClient instance.
   *
   * @param options - The configuration options.
   * @param options.authKey - The authentication key provided by ZIQX.
   * @param options.redirectUrl - The URL where the user should be redirected after authentication.
   * @param options.codeChallenge - The code challenge for PKCE flow.
   * @param options.codeChallengeMethod - (Optional) The code challenge method (e.g., "S256"). Default is "plaintext".
   * @param options.state - (Optional) An opaque value used to maintain state between the request and the callback.
   * @throws Will throw an error if `authKey`, `redirectUrl`, or `codeChallenge` are missing.
   */
  constructor({
    authKey,
    redirectUrl,
    codeChallenge,
    codeChallengeMethod,
    state,
  }: {
    authKey: string;
    redirectUrl: string;
    codeChallenge: string;
    codeChallengeMethod?: string;
    state?: string;
  }) {
    if (!authKey || !redirectUrl || !codeChallenge) {
      throw new Error(
        "ZAuthClient: Missing required parameters. `authKey`, `redirectUrl`, and `codeChallenge` are required.",
      );
    }
    this.authKey = authKey;
    this.redirectUrl = redirectUrl;
    this.codeChallenge = codeChallenge;
    this.codeChallengeMethod = codeChallengeMethod;
    this.state = state;
  }

  /**
   * Redirects the user to the ZIQX authentication page.
   */
  login(): void {
    const stateQuery = this.state ? `&state=${this.state}` : "";
    const codeChallengeMethodQuery = this.codeChallengeMethod
      ? `&challenge_method=${this.codeChallengeMethod}`
      : "";
    const loginUrl = `${ZAUTH_BASE_URL}?key=${this.authKey}&redir=${this.redirectUrl}&code_challenge=${this.codeChallenge}${codeChallengeMethodQuery}${stateQuery}`;

    // Redirect user to the authentication page
    window.location.href = loginUrl;
  }
}
