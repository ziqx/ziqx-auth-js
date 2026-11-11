import type { PkcePair } from "./types";

const base64Url = (bytes: Uint8Array) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/**
 * Creates an S256 PKCE pair. Keep `verifier` (e.g. in a cookie or session)
 * until the callback, and send `challenge` to {@link ZAuthClient.login}.
 *
 * Works in browsers and Node 18+ (Web Crypto).
 *
 * @example
 * ```ts
 * const { verifier, challenge } = await createPkce();
 * sessionStorage.setItem("zauth_verifier", verifier);
 * auth.login({ redirectUrl, codeChallenge: challenge, codeChallengeMethod: "S256" });
 * ```
 */
export async function createPkce(): Promise<PkcePair> {
  const crypto = globalThis.crypto;
  if (!crypto?.subtle) {
    throw new Error("createPkce: Web Crypto is not available in this runtime.");
  }
  // 32 random bytes → a 43-character verifier, the RFC 7636 minimum.
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return {
    verifier,
    challenge: base64Url(new Uint8Array(digest)),
    method: "S256",
  };
}
