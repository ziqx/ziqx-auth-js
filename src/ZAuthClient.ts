import { endpoints } from "./constants";
import type { LoginOptions, ZAuthOptions } from "./types";

/**
 * ZAuthClient - A lightweight authentication client for ZIQX Auth.
 *
 * Sends the user to the Ziqx sign-in page with an S256 PKCE challenge.
 *
 * Example:
 * ```ts
 * import { ZAuthClient, createPkce } from "@ziqx/auth";
 *
 * const auth = new ZAuthClient({ authKey: "zdev_…" });
 * const { verifier, challenge } = await createPkce();
 * sessionStorage.setItem("zauth_verifier", verifier);
 *
 * auth.login({
 *   redirectUrl: "https://app.example.com/auth/callback",
 *   codeChallenge: challenge,
 *   codeChallengeMethod: "S256",
 *   state: crypto.randomUUID(),
 * });
 * ```
 */
export class ZAuthClient {
  private authKey: string;
  private authorizeUrl: string;

  /**
   * Creates a new ZAuthClient instance.
   * @param options.authKey - Your app key (Auth → Client credentials → App key).
   * @param options.baseUrl - (Optional) Ziqx host; defaults to `https://ziqx.cc`.
   * @throws Will throw an error if `authKey` is missing.
   */
  constructor({ authKey, baseUrl }: { authKey: string } & ZAuthOptions) {
    if (!authKey) {
      throw new Error(
        "ZAuthClient: Missing required parameters. `authKey` is required.",
      );
    }
    this.authKey = authKey;
    this.authorizeUrl = endpoints(baseUrl).authorize;
  }

  /**
   * Builds the sign-in URL without navigating, for server-side redirects.
   * @throws If `redirectUrl` or `codeChallenge` is missing.
   */
  getLoginUrl({
    redirectUrl,
    codeChallenge,
    codeChallengeMethod,
    state,
    scope,
  }: LoginOptions): string {
    if (!redirectUrl || !codeChallenge) {
      throw new Error(
        "ZAuthClient: `redirectUrl` and `codeChallenge` are required.",
      );
    }
    const query = new URLSearchParams({
      key: this.authKey,
      redir: redirectUrl,
      code_challenge: codeChallenge,
    });
    if (codeChallengeMethod) query.set("challenge_method", codeChallengeMethod);
    if (state) query.set("state", state);
    if (scope)
      query.set("scope", Array.isArray(scope) ? scope.join(" ") : scope);
    return `${this.authorizeUrl}?${query}`;
  }

  /**
   * Redirects the user to the ZIQX authentication page.
   * @param options.redirectUrl - Exact redirect URL registered for your app.
   * @param options.codeChallenge - PKCE challenge (see `createPkce`).
   * @param options.codeChallengeMethod - (Optional) `"S256"` (recommended). When omitted the challenge is treated as a plain verifier.
   * @param options.state - (Optional) An opaque value returned on the callback.
   * @param options.scope - (Optional) Scopes; defaults to `openid email profile`.
   */
  login(options: LoginOptions): void {
    window.location.href = this.getLoginUrl(options);
  }
}
