# @ziqx/auth

A lightweight authentication SDK for ZIQX platforms. Provides an easy interface to trigger the authentication flow from your frontend.

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

## Example Implementation

```typescript
import { ZAuthClient } from "@ziqx/auth";

const auth = new ZAuthClient({ authKey: "12345-xyz" });

document.getElementById("loginBtn")?.addEventListener("click", () => {
  auth.login();
});
```

---

## Notes

- Make sure your `authKey` is valid and corresponds to your environment.
- If you’re working on localhost or staging, use `auth.login(true)` to switch to dev mode.
- This SDK must be used in **client-side code only** — calling `login()` in a Server Component will throw an error.

---

## License

MIT License © 2025 [ZIQX]
