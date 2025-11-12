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
});
```

### Trigger Login

```typescript
auth.login(); // Redirects to live auth environment
```

### Trigger Login in Development Mode

If you're working in a development environment, enable dev mode:

```typescript
auth.login(true); // Redirects to dev auth environment
```

---

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
new ZAuthClient(options: { authKey: string });
```

| Parameter | Type   | Required | Description                               |
| --------- | ------ | -------- | ----------------------------------------- |
| `authKey` | string | ✅ Yes   | Your unique authentication key from ZIQX. |

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

Validates a given authentication token with the ZIQX Auth API.

| Parameter | Type   | Required | Description                                |
| --------- | ------ | -------- | ------------------------------------------ |
| `token`   | string | ✅ Yes   | The authentication token (JWT or similar). |

**Example:**

```typescript
const tokenService = new ZAuthTokenService();
const isValid = await tokenService.validate("your-jwt-token");
```

Returns `true` if the token is valid and authorized, otherwise `false`.

---

## Example Implementation

```typescript
import { ZAuthClient, ZAuthTokenService } from "@ziqx/auth";

const auth = new ZAuthClient({ authKey: "12345-xyz" });

// Login
const loginBtn = document.getElementById("loginBtn");
loginBtn?.addEventListener("click", () => {
  auth.login();
});

// Token validation example
const tokenService = new ZAuthTokenService();
const token = localStorage.getItem("ziqx_token");

if (token) {
  const isValid = await tokenService.validate(token);
  console.log("Token valid:", isValid);
}
```

---

## Notes

- Make sure your `authKey` is valid and corresponds to your environment.
- Use `auth.login(true)` in development mode (e.g., on localhost or staging).
- The `ZAuthTokenService` uses `https://ziqx.cc/api/auth/validate-token` internally.
- This SDK is for **client-side use** only.

---

## License

MIT License © 2025 [ZIQX]
