---
name: ziqx_auth_sdk
description: SDK for Ziqx Authentication providing client-side login redirection and server-side token validation.
---

# Ziqx Auth SDK Skill

This skill provides comprehensive instructions for using the `@ziqx/auth` SDK in JavaScript/TypeScript applications, with specific focus on Next.js integration using Server Actions.

## Library Architecture

The SDK consists of two primary classes:

- **`ZAuthClient`**: Handles user-facing interactions like login redirection. It uses `window.location.href` and is **Client-Only**.
- **`ZAuthTokenService`**: Handles back-end operations like token exchange and validation. It uses `fetch` and is **Server-Compatible** (though it can also be used on the client if necessary).

## Environment Compatibility

| Method                           | Component Type   | Environment  | Description                         |
| :------------------------------- | :--------------- | :----------- | :---------------------------------- |
| `ZAuthClient.login`              | Client Component | Browser      | Redirects to Ziqx Auth gateway.     |
| `ZAuthTokenService.validate`     | Server/Client    | Node/Browser | Validates a JWT/Token.              |
| `ZAuthTokenService.getAuthToken` | Server/Client    | Node/Browser | Exchanges an auth code for a token. |

> [!IMPORTANT]
> Always perform token exchange (`getAuthToken`) and sensitive validation on the **Server** to protect your `authSecret`.

## Core Usage Examples

### 1. Simple Login (Client-Side)

```typescript
import { ZAuthClient } from "@ziqx/auth";

const auth = new ZAuthClient({ authKey: "YOUR_AUTH_KEY" });

// Trigger login flow
auth.login({
  redirectUrl: "https://your-app.com/callback",
  codeChallenge: "PKCE_CHALLENGE_STRING",
  state: "OPTIONAL_STATE",
});
```

### 2. Token Validation

```typescript
import { ZAuthTokenService } from "@ziqx/auth";

const tokenService = new ZAuthTokenService();
const isValid = await tokenService.validate("USER_JWT_TOKEN");
```

## Next.js Integration (App Router)

### Client Button for Login

Use a Client Component for the login button as it requires browser APIs.

```tsx
"use client";
import { ZAuthClient } from "@ziqx/auth";

export function LoginButton() {
  const handleLogin = () => {
    const auth = new ZAuthClient({
      authKey: process.env.NEXT_PUBLIC_ZAUTH_KEY!,
    });
    auth.login({
      redirectUrl: `${window.location.origin}/api/auth/callback`,
      codeChallenge: "...", // Generate this dynamically
    });
  };

  return <button onClick={handleLogin}>Login with Ziqx</button>;
}
```

### Server Actions for Token Exchange

Perform the code-to-token exchange in a Server Action to keep your `authSecret` private.

```typescript
// app/actions/auth.ts
"use server";

import { ZAuthTokenService } from "@ziqx/auth";
import { cookies } from "next/headers";

export async function handleAuthCode(code: string, codeVerifier: string) {
  const tokenService = new ZAuthTokenService();

  try {
    const tokenData = await tokenService.getAuthToken({
      authAppKey: process.env.ZAUTH_APP_KEY!,
      authSecret: process.env.ZAUTH_SECRET!,
      code,
      codeVerifier,
      redirectUri: process.env.ZAUTH_REDIRECT_URI!,
    });

    if (tokenData.access_token) {
      // Store in secure HttpOnly cookie
      cookies().set("session", tokenData.access_token, {
        httpOnly: true,
        secure: true,
      });
      return { success: true };
    }
  } catch (error) {
    return { success: false, error: "Failed to exchange token" };
  }
}
```

### Server Side Validation (Middleware or Server Components)

```typescript
// app/auth-check.ts
"use server";

import { ZAuthTokenService } from "@ziqx/auth";
import { cookies } from "next/headers";

export async function getSession() {
  const token = cookies().get("session")?.value;
  if (!token) return null;

  const tokenService = new ZAuthTokenService();
  const isValid = await tokenService.validate(token);

  return isValid ? token : null;
}
```

## Advanced Next.js Implementation (Real-world Pattern)

This section demonstrates a complete authentication flow using **PKCE**, **Cookies**, and **Server Actions** for a secure production-ready setup.

### 1. SDK Instance Setup

Centralize the `ZAuthClient` configuration.

```typescript
// services/zauth.ts
import { ZAuthClient } from "@ziqx/auth";

export const zAuthClient = new ZAuthClient({
  authKey: process.env.NEXT_PUBLIC_ZIQX_AUTH_APP_KEY!,
});
```

### 2. Client-Side Login & State Management

Use a "SaveToken" or "AuthHandler" component to manage redirection and token storage.

```tsx
"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { zAuthClient } from "@/services/zauth";
import { uidShort } from "@/functions/utils/uuid";

const AuthHandler = ({ redir, token }: { redir?: string; token?: string }) => {
  useEffect(() => {
    if (redir) {
      Cookies.set("redir", redir);
    }

    if (token) {
      // Token received from Server Action
      Cookies.remove("code_challenge");
      // setAuthToken(token); // Your custom token storage logic

      const redirect = Cookies.get("redir");
      setTimeout(() => {
        window.location.replace(redirect || "/console/");
        if (redirect) Cookies.remove("redir");
      }, 500);
    } else {
      // Trigger new login
      const challenge = uidShort();
      Cookies.set("code_challenge", challenge);

      setTimeout(() => {
        zAuthClient.login({
          redirectUrl: process.env.NEXT_PUBLIC_ZAUTH_REDIRECT_URL!,
          codeChallenge: challenge,
        });
      }, 1000);
    }
  }, [redir, token]);

  return null;
};

export default AuthHandler;
```

### 3. Server Action for Token Exchange

Handle the `getAuthToken` exchange on the server to protect your `authSecret`.

```typescript
// actions/auth.ts
"use server";

import { ZAuthTokenService } from "@ziqx/auth";
import { cookies } from "next/headers";

export async function getAccessToken(code?: string) {
  if (!code) return null;

  const challenge = cookies().get("code_challenge")?.value;
  if (!challenge) return null;

  const tokenService = new ZAuthTokenService();
  const tokens = await tokenService.getAuthToken({
    authAppKey: process.env.ZAUTH_APP_KEY!,
    authSecret: process.env.ZIQX_AUTH_SECRET!,
    codeVerifier: challenge,
    code,
    redirectUri: process.env.ZAUTH_REDIRECT_URL!,
  });

  return tokens?.access_token;
}
```

### 4. Unified Login Page (Server Component)

The main login page coordinates the Server Action and the Client-side handler.

```tsx
// app/login/page.tsx
import AuthHandler from "./AuthHandler";
import { getAccessToken } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ redir: string; code: string }>;
};

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const { redir, code } = await searchParams;
  const token = await getAccessToken(code);

  return (
    <div>
      <AuthHandler redir={redir} token={token} />
      <main className="h-[100svh] flex items-center justify-center">
        <p>Authenticating...</p>
      </main>
    </div>
  );
};

export default LoginPage;
```

## Best Practices

1. **Keep Secrets Secret**: Never expose `authSecret` in client-side code or `NEXT_PUBLIC_` environment variables.
2. **PKCE Flow**: Use unique `codeChallenge` and `codeVerifier` (stored in cookies) to prevent authorization code injection.
3. **HTTP-Only Cookies**: Store access tokens in `httpOnly` cookies in Next.js for maximum security.
4. **Environment Variables**: Use `NEXT_PUBLIC_` only for public keys and redirect URLs. Keep `authSecret` strictly server-side.
5. **Session Validation**: Always validate tokens on the server (e.g., in Middleware) before granting access to protected routes.
