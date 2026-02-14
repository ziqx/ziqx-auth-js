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

### Trigger Login in Development Mode

If you're working in a development environment, enable dev mode:

```typescript
auth.login(true); // Redirects to dev auth environment (http://localhost:3000/zauth)
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

## Token Validation

You can use the `ZAuthTokenService` class to validate authentication tokens issued by ZIQX.

```typescript
import { ZAuthTokenService } from "@ziqx/auth";

const tokenService = new ZAuthTokenService();

const isValid = await tokenService.validate("your-jwt-token");

if (isValid) {
  console.log("Token is valid");
} else {
  console.log("Invalid or expired token");
}
```

---

## API Reference

### Class: `ZAuthClient`

#### Constructor

```typescript
new ZAuthClient(options: {
  authKey: string;
  redirectUrl: string;
  codeChallenge: string;
  codeChallengeMethod?: string;
  state?: string;
});
```

| Parameter             | Type   | Required | Description                                                       |
| --------------------- | ------ | -------- | ----------------------------------------------------------------- |
| `authKey`             | string | ✅ Yes   | Your unique authentication key from ZIQX.                         |
| `redirectUrl`         | string | ✅ Yes   | The URL where the user should be redirected after authentication. |
| `codeChallenge`       | string | ✅ Yes   | The code challenge for PKCE flow.                                 |
| `codeChallengeMethod` | string | ❌ No    | (Optional) The code challenge method (e.g., "S256").              |
| `state`               | string | ❌ No    | (Optional) An opaque value used to maintain state.                |

#### Methods

##### `login(isDev?: boolean): void`

Redirects the user to the ZIQX authentication portal.

| Parameter | Type    | Default | Description                                              |
| --------- | ------- | ------- | -------------------------------------------------------- |
| `isDev`   | boolean | `false` | Set `true` to redirect to the dev authentication portal. |

**Example:**

```typescript
auth.login(); // Redirects to production portal
auth.login(true); // Redirects to development portal
```

---

### Class: `ZAuthTokenService`

#### Methods

##### `validate(token: string): Promise<boolean>`

Validates a given authentication token with the ZIQX Auth API (V1).

| Parameter | Type   | Required | Description                                |
| --------- | ------ | -------- | ------------------------------------------ |
| `token`   | string | ✅ Yes   | The authentication token (JWT or similar). |

##### `validateV2(token: string): Promise<boolean>`

Validates a given authentication token with the ZIQX Auth API (V2).

| Parameter | Type   | Required | Description                           |
| --------- | ------ | -------- | ------------------------------------- |
| `token`   | string | ✅ Yes   | The authentication token to validate. |

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

// Token validation example
const tokenService = new ZAuthTokenService();
const token = localStorage.getItem("ziqx_token");

if (token) {
  const isValid = await tokenService.validateV2(token);
  console.log("Token valid:", isValid);
}
```

---

## Notes

- Make sure your `authKey` is valid and corresponds to your environment.
- Use `auth.login(true)` in development mode (e.g., on localhost or staging).
- The `ZAuthTokenService` uses `https://ziqx.cc/api/auth/validate-token` internally for V1 and `https://ziqx.cc/zauth/validate` for V2.
- This SDK is for **client-side use** only.

---

## License

MIT License © 2025 [ZIQX]
