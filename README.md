# @ziqx/auth

A lightweight authentication SDK for ZIQX platforms. Provides an easy interface to trigger the authentication flow and validate tokens from your frontend.

---

## Installation

```bash
npm install @ziqx/auth
```

or

```bash
yarn add @ziqx/auth
```

---

## Usage

### Import and Initialize

```typescript
import { ZAuthClient } from "@ziqx/auth";

const auth = new ZAuthClient({
  authKey: "YOUR_AUTH_KEY",
  redirectUrl: "YOUR_REDIRECT_URL",
  codeChallenge: "YOUR_CODE_CHALLENGE",
  // Optional parameters
  // codeChallengeMethod: "S256",
  // state: "YOUR_STATE_STRING"
});
```

### Trigger Login

```typescript
auth.login(); // Redirects to live auth environment
```

---

## Access Token Exchange

You can use the `ZAuthTokenService` class to exchange an authorization code for an access token.

```typescript
import { ZAuthTokenService } from "@ziqx/auth";

const tokenService = new ZAuthTokenService();

const tokenData = await tokenService.getAuthToken({
  authAppKey: "your-app-key",
  authSecret: "your-app-secret",
  code: "authorization-code",
  codeVerifier: "code-verifier",
  redirectUri: "redirect-uri",
});
```

## Token Verification

Use `ZAuthTokenService.verify()` to verify a token **locally** against ZIQX's
public key (ES256). The public key is fetched once from the JWKS endpoint and
cached, so there's no network round-trip per request, and a token cannot be
forged or tampered with without ZIQX's private key.

```typescript
import { ZAuthTokenService } from "@ziqx/auth";

const tokenService = new ZAuthTokenService();

try {
  // Pass your app id to also assert the token's audience (`aud`).
  const claims = await tokenService.verify("your-jwt-token", {
    appId: "your-app-id",
  });
  console.log("Authenticated user:", claims.sub, claims.email);
} catch {
  console.log("Invalid or expired token");
}
```

> **Deprecated:** `validate()` / `validateV2()` call the ZIQX validation
> endpoint over the network on every request. Prefer `verify()`, which is
> faster, works offline after the first key fetch, and returns the decoded
> claims. The old methods still work but will be removed in a future release.

---

## API Reference

### Class: `ZAuthClient`

#### Constructor

```typescript
new ZAuthClient(options: {
  authKey: string;

});
```

| Parameter | Type   | Required | Description                               |
| --------- | ------ | -------- | ----------------------------------------- |
| `authKey` | string | ✅ Yes   | Your unique authentication key from ZIQX. |

#### Methods

##### `login(): void`

Redirects the user to the ZIQX authentication portal.

| Parameter             | Type   | Required | Description                                                       |
| --------------------- | ------ | -------- | ----------------------------------------------------------------- |
| `redirectUrl`         | string | ✅ Yes   | The URL where the user should be redirected after authentication. |
| `codeChallenge`       | string | ✅ Yes   | The code challenge for PKCE flow.                                 |
| `codeChallengeMethod` | string | ❌ No    | (Optional) The code challenge method (e.g., "S256").              |
| `state`               | string | ❌ No    | (Optional) An opaque value used to maintain state.                |

**Example:**

```typescript
auth.login({
  redirectUrl: "";
  codeChallenge: "";
  codeChallengeMethod: "";
  state: "";
  }); // Redirects to production portal
```

---

### Class: `ZAuthTokenService`

#### Methods

##### `verify(token: string, options?: VerifyOptions): Promise<ZAuthTokenPayload>`

Verifies a token locally against ZIQX's public key (ES256) and returns the
decoded claims. Throws if the token is missing, malformed, expired, or fails
signature / issuer / audience checks. A leading `"Bearer "` is allowed.

| Parameter        | Type   | Required | Description                                                          |
| ---------------- | ------ | -------- | -------------------------------------------------------------------- |
| `token`          | string | ✅ Yes   | The OAuth token to verify.                                           |
| `options.appId`  | string | ❌ No    | When provided, the token's `aud` claim must match this app id.       |

##### `validate(token: string): Promise<boolean>` _(deprecated)_

> **Deprecated — use `verify()`.** Validates a token by calling the ZIQX Auth
> API over the network. Kept for backward compatibility.

| Parameter | Type   | Required | Description                                |
| --------- | ------ | -------- | ------------------------------------------ |
| `token`   | string | ✅ Yes   | The authentication token (JWT or similar). |

##### `getAuthToken(params: GetAuthTokenParams): Promise<any>`

Exchanges an authorization code for an access token.

**Parameters:**

| Parameter      | Type   | Required | Description                                        |
| -------------- | ------ | -------- | -------------------------------------------------- |
| `authAppKey`   | string | ✅ Yes   | The application key.                               |
| `authSecret`   | string | ✅ Yes   | The application secret.                            |
| `code`         | string | ✅ Yes   | The authorization code received from the callback. |
| `codeVerifier` | string | ✅ Yes   | The code verifier used in PKCE.                    |
| `redirectUri`  | string | ✅ Yes   | The redirect URI used in the initial request.      |

**Example:**

```typescript
const tokenService = new ZAuthTokenService();
const tokenData = await tokenService.getAuthToken({
  authAppKey: "your-app-key",
  authSecret: "your-app-secret",
  code: "authorization-code",
  codeVerifier: "code-verifier",
  redirectUri: "redirect-uri",
});
```

---

## Example Implementation

```typescript
import { ZAuthClient, ZAuthTokenService } from "@ziqx/auth";

const auth = new ZAuthClient({
  authKey: "12345-xyz",
  redirectUrl: "https://myapp.com/callback",
  codeChallenge: "pkce-challenge-string",
});

// Login
const loginBtn = document.getElementById("loginBtn");
loginBtn?.addEventListener("click", () => {
  auth.login();
});

// Token verification example
const tokenService = new ZAuthTokenService();
const token = localStorage.getItem("ziqx_token");

if (token) {
  try {
    const claims = await tokenService.verify(token, { appId: "12345-xyz" });
    console.log("Authenticated user:", claims.sub);
  } catch {
    console.log("Invalid or expired token");
  }
}
```

---

## Notes

- Make sure your `authKey` is valid and corresponds to your environment.
- `verify()` fetches the public key from `https://ziqx.cc/zauth/jwks.json` (cached after first use). The deprecated `validate()` calls `https://ziqx.cc/zauth/validate` over the network.
- `verify()` works both client-side and server-side. The `getAuthToken()` exchange (which uses your app secret) should only run on a trusted server.

---

## AI Agent Skills

If you are using an AI agent (like Antigravity), you can add `ziqx-auth-js` related skills to your agent using the following command:

```bash
npx skills add ziqx/ziqx-ai-skills
```

---

## License

MIT License © 2025 [ZIQX]
