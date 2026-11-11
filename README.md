# @ziqx/auth

A lightweight SDK for **Sign in with Ziqx**: send users to the Ziqx sign-in page with PKCE, exchange the code on your server, and verify tokens locally.

Works with apps created in [Ziqx Developers](https://developers.ziqx.cc) (`zdev_…` app keys) and with older apps.

---

## Installation

```bash
npm install @ziqx/auth
```

---

## Quick start

You need three values from **Ziqx Developers → your app → Auth**:

- **App key** (public, e.g. `zdev_…`)
- **Client secret** (server only; shown once when created or rotated)
- A **redirect URL** you added under _Redirect URLs_ (must match exactly)

### 1. Send the user to sign in (browser)

```typescript
import { ZAuthClient, createPkce } from "@ziqx/auth";

const auth = new ZAuthClient({ authKey: "zdev_…" });

const { verifier, challenge } = await createPkce();
// Keep the verifier until the callback (e.g. a cookie your server can read).
document.cookie = `zauth_verifier=${verifier}; Path=/; Secure; SameSite=Lax`;

auth.login({
  redirectUrl: "https://app.example.com/auth/callback",
  codeChallenge: challenge,
  codeChallengeMethod: "S256",
  state: crypto.randomUUID(), // check it on the callback
});
```

Need the URL on the server instead? Use `auth.getLoginUrl({ ... })`.

### 2. Exchange the code (server)

Ziqx redirects back to your redirect URL with `?code=…&state=…`.

```typescript
import { ZAuthTokenService } from "@ziqx/auth";

const tokenService = new ZAuthTokenService();

const result = await tokenService.getAuthToken({
  authAppKey: process.env.ZAUTH_APP_KEY!,
  authSecret: process.env.ZAUTH_SECRET!,
  code,
  codeVerifier: verifier, // from step 1
  redirectUri: "https://app.example.com/auth/callback",
});

if ("access_token" in result) {
  // Store result.access_token in an httpOnly cookie.
} else {
  console.error(result.error); // e.g. "invalid_grant"
}
```

### 3. Verify tokens (server or browser)

`verify()` checks the token **locally** against Ziqx's public key (ES256). The key is fetched once from the JWKS endpoint and cached.

```typescript
try {
  const claims = await tokenService.verify(token, { appKey: "zdev_…" });
  console.log(claims.sub, claims.email);
} catch {
  // invalid, expired, or issued for another app
}
```

> Tokens use your **app key** as their audience (`aud`, same as `azp`). Pass `appKey`, not the app ID.

---

## Local development

Point both classes at a local core-web:

```typescript
const auth = new ZAuthClient({ authKey: "zdev_…", baseUrl: "http://localhost:3000" });
const tokenService = new ZAuthTokenService({ baseUrl: "http://localhost:3000" });
```

Plain HTTP redirect URLs are allowed only on `localhost`.

---

## API Reference

### `createPkce(): Promise<{ verifier, challenge, method: "S256" }>`

Creates an S256 PKCE pair (43-character verifier and challenge). Works in browsers and Node 18+.

### Class: `ZAuthClient`

```typescript
new ZAuthClient({ authKey: string, baseUrl?: string })
```

#### `login(options: LoginOptions): void` / `getLoginUrl(options: LoginOptions): string`

| Option                | Type               | Required | Description                                                                                              |
| --------------------- | ------------------ | -------- | -------------------------------------------------------------------------------------------------------- |
| `redirectUrl`         | string             | ✅ Yes   | Exact redirect URL registered for your app.                                                              |
| `codeChallenge`       | string             | ✅ Yes   | PKCE challenge from `createPkce()`.                                                                      |
| `codeChallengeMethod` | `"S256"`           | ❌ No    | Use `"S256"`. When omitted the challenge is treated as a plain verifier (kept for older integrations).  |
| `state`               | string             | ❌ No    | Returned unchanged on the callback.                                                                      |
| `scope`               | string \| string[] | ❌ No    | `openid` plus `email` and/or `profile`. Defaults to `openid email profile`.                              |

### Class: `ZAuthTokenService`

```typescript
new ZAuthTokenService({ baseUrl?: string })
```

#### `verify(token, options?): Promise<ZAuthTokenPayload>`

Verifies signature, issuer (`ziqx.cc`) and expiry. A leading `"Bearer "` is allowed.

| Option           | Type   | Description                                                |
| ---------------- | ------ | ---------------------------------------------------------- |
| `options.appKey` | string | Your app key. The token's audience must match it.          |
| `options.appId`  | string | _Deprecated_ alias of `appKey`; must still be the app key. |

Claims: `sub` (user's Ziqx open id), `azp`/`aud` (app key), `iss`, `iat`, `exp`, `email`, `username`, `fullname`, `phone`. For Ziqx Developers apps, `email` needs the `email` scope, `username`/`fullname` need `profile`, and `phone` is always empty.

#### `getAuthToken(params): Promise<ZAuthTokenResponse>`

Exchanges an authorization code. Server only: it sends your client secret.

| Parameter      | Type   | Description                              |
| -------------- | ------ | ---------------------------------------- |
| `authAppKey`   | string | Your app key.                            |
| `authSecret`   | string | Your client secret.                      |
| `code`         | string | The `code` from the callback URL.        |
| `codeVerifier` | string | The PKCE verifier from `createPkce()`.   |
| `redirectUri`  | string | The same redirect URL used to sign in.   |

Resolves to `{ access_token, token_type: "Bearer", id_token }` or `{ error }` (`invalid_request`, `invalid_client`, `invalid_grant`, `unsupported_grant_type`, `temporarily_unavailable`, `server_error`). Codes are single use and expire quickly.

#### `validate(token, { appKey, appSecret }): Promise<boolean>` _(deprecated)_

Checks a token over the network. The endpoint requires your client credentials; without them this resolves to `false`. Prefer `verify()`.

---

## AI Agent Skills

```bash
npx skills add ziqx/ziqx-ai-skills
```

---

## License

MIT License © 2025 [ZIQX]
