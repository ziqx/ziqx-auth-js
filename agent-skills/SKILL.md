---
name: ziqx-auth-sdk
description: SDK for Ziqx Authentication (Sign in with Ziqx) — S256 PKCE login redirection, server-side code exchange, and local token verification. Works with Ziqx Developers apps (zdev_ keys) and older apps.
---

# Ziqx Auth SDK Skill

How to use `@ziqx/auth` in JavaScript/TypeScript apps, with a focus on Next.js (App Router).

## What the app needs (from Ziqx Developers → app → Auth)

- **App key** — public, e.g. `zdev_…`. Safe in `NEXT_PUBLIC_` variables.
- **Client secret** — server only. Shown once at creation or rotation.
- **Redirect URL** — must be added under _Redirect URLs_ and match **exactly** (HTTPS, or `http://localhost`).

## Library Architecture

- **`createPkce()`** — makes an S256 PKCE pair (`verifier`, `challenge`). Browser and Node 18+.
- **`ZAuthClient`** — builds the sign-in URL (`getLoginUrl`) or redirects (`login`, browser only).
- **`ZAuthTokenService`** — exchanges codes (`getAuthToken`, server only) and verifies tokens locally (`verify`).

| Method                           | Environment  | Description                                    |
| :------------------------------- | :----------- | :--------------------------------------------- |
| `createPkce`                     | Node/Browser | S256 verifier + challenge.                     |
| `ZAuthClient.login`              | Browser      | Redirects to Ziqx sign-in.                     |
| `ZAuthClient.getLoginUrl`        | Node/Browser | Sign-in URL for server redirects.              |
| `ZAuthTokenService.getAuthToken` | Server       | Exchanges a code for a token (uses secret).    |
| `ZAuthTokenService.verify`       | Node/Browser | Verifies a token locally (ES256 via JWKS).     |
| `ZAuthTokenService.validate`     | Server       | _Deprecated._ Needs `{ appKey, appSecret }`.   |

Rules:

- Always use `codeChallengeMethod: "S256"` with `createPkce()`. Never send the verifier as the challenge.
- Tokens use the **app key** as audience: `verify(token, { appKey })`. Do not pass the app ID.
- `getAuthToken` resolves with `{ access_token, … }` or `{ error }`; check which.
- For a local core-web, pass `baseUrl: "http://localhost:3000"` to both classes.

## Next.js Integration (App Router)

### 1. Start sign-in (Route Handler)

Create the PKCE pair on the server, keep the verifier and state in httpOnly cookies, and redirect.

```typescript
// app/auth/login/route.ts
import { NextResponse } from "next/server";
import { ZAuthClient, createPkce } from "@ziqx/auth";

export async function GET() {
  const { verifier, challenge } = await createPkce();
  const state = crypto.randomUUID();
  const auth = new ZAuthClient({ authKey: process.env.ZAUTH_APP_KEY! });

  const response = NextResponse.redirect(
    auth.getLoginUrl({
      redirectUrl: process.env.ZAUTH_REDIRECT_URL!,
      codeChallenge: challenge,
      codeChallengeMethod: "S256",
      state,
    }),
  );
  const cookie = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: 600 };
  response.cookies.set("zauth_verifier", verifier, cookie);
  response.cookies.set("zauth_state", state, cookie);
  return response;
}
```

A login button then just links to `/auth/login`.

### 2. Callback: exchange the code

```typescript
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ZAuthTokenService } from "@ziqx/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const verifier = request.cookies.get("zauth_verifier")?.value;
  if (!code || !verifier || state !== request.cookies.get("zauth_state")?.value)
    return NextResponse.redirect(new URL("/login?error=state", request.url));

  const result = await new ZAuthTokenService().getAuthToken({
    authAppKey: process.env.ZAUTH_APP_KEY!,
    authSecret: process.env.ZAUTH_SECRET!,
    code,
    codeVerifier: verifier,
    redirectUri: process.env.ZAUTH_REDIRECT_URL!,
  });
  if (!("access_token" in result))
    return NextResponse.redirect(new URL(`/login?error=${result.error}`, request.url));

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("session", result.access_token, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  response.cookies.delete("zauth_verifier");
  response.cookies.delete("zauth_state");
  return response;
}
```

### 3. Read the session (Server Components, Route Handlers)

```typescript
// lib/session.ts
import { cookies } from "next/headers";
import { ZAuthTokenService } from "@ziqx/auth";

const tokenService = new ZAuthTokenService();

export async function getSession() {
  const token = (await cookies()).get("session")?.value;
  if (!token) return null;
  try {
    return await tokenService.verify(token, { appKey: process.env.ZAUTH_APP_KEY! });
  } catch {
    return null;
  }
}
```

Claims: `sub` (user's Ziqx open id), `email` (with `email` scope), `username`/`fullname` (with `profile` scope). `phone` is empty for Ziqx Developers apps.

## Best Practices

1. **Keep Secrets Secret**: never put the client secret in client code or `NEXT_PUBLIC_` variables.
2. **S256 PKCE + state**: a fresh verifier and state per sign-in, stored in short-lived httpOnly cookies; check `state` on the callback.
3. **Exact redirect URL**: the same string in Ziqx Developers, `login`/`getLoginUrl`, and `getAuthToken`.
4. **HTTP-only cookies** for the access token.
5. **Verify on the server** with `verify(token, { appKey })` before granting access.
