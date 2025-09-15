# EasyAuth

Type-safe, self-hosted authentication with Clerk-like DX and next-auth-like flexibility.

EasyAuth is a modular monorepo under the `@easyauth-js/*` scope. It aims to provide a clean core, first-class Next.js support, and a pluggable adapter/provider system so you can bring your own database, email, and infrastructure.

Status: Early WIP. The `@easyauth-js/core` package currently ships types and the database Adapter contract with an in-memory reference adapter. See Roadmap for upcoming features.

## Packages (planned)

- `@easyauth-js/core` — core types, adapter contract, minimal config, in-memory adapter
- `@easyauth-js/nextjs` — Next.js SDK (App + Pages Router, middleware)
- `@easyauth-js/react` — headless hooks + UI primitives
- `@easyauth-js/express` — Node/Express/Fastify helpers
- `@easyauth-js/adapters-*` — database adapters (postgres/mysql/sqlite/mongo)
- `@easyauth-js/providers-*` — OAuth providers (google/github/discord/...)
- `@easyauth-js/email-*` — email adapters (smtp/ses/sendgrid/resend)
- `@easyauth-js/cli` — init, generate, migrate, dev
- `@easyauth-js/ui` — optional widgets (unstyled + Tailwind set)
- `@easyauth-js/server` — self-hosted service (REST API + admin)
- `@easyauth-js/examples/*` — example apps

## Install (core, WIP)

Until the monorepo is published, you can use the core package locally or via workspace. The public API is stable enough for early experimentation.

```bash
pnpm add @easyauth-js/core
# or
npm i @easyauth-js/core
```

## Core Concepts

- **Adapter**: A database-agnostic interface that persists `User`, `Account`, `Session`, and `VerificationToken` and records audit events. You implement this once per datastore; all higher layers use the same contract.
- **Config**: A single source of truth describing baseUrl, cookies, JWT/session strategy, rate limiting, features, providers, and your adapter instance.
- **Memory adapter**: A non-persistent, in-memory reference adapter useful for tests and demos.

### Types (selected)

```ts
type User = {
  id: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date /* ... */;
};
type Account = {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string /* ... */;
};
type Session = {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
type VerificationToken = {
  id: string;
  identifier: string;
  token: string;
  expiresAt: Date;
};
```

### Adapter interface

```ts
interface Adapter {
  // Users
  createUser(data: Partial<User>): Promise<User>;
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;

  // Accounts (OAuth)
  linkAccount(acc: Account): Promise<Account>;
  getAccountByProvider(
    provider: string,
    providerAccountId: string
  ): Promise<Account | null>;

  // Sessions
  createSession(
    s: Omit<Session, "id" | "createdAt" | "updatedAt">
  ): Promise<Session>;
  getSession(id: string): Promise<Session | null>;
  deleteSession(id: string): Promise<void>;

  // Tokens (email verify, password reset)
  createVerificationToken(v: VerificationToken): Promise<VerificationToken>;
  useVerificationToken(
    identifier: string,
    token: string
  ): Promise<VerificationToken | null>;

  // Audit
  appendAudit(event: {
    type: string;
    userId?: string;
    ip?: string;
    meta?: unknown;
  }): Promise<void>;
}
```

### Minimal config

```ts
import { createConfig, createMemoryAdapter } from "@easyauth-js/core";

const config = createConfig({
  baseUrl: "http://localhost:3000",
  cookie: { sameSite: "lax", secure: false },
  jwt: { issuer: "example-app", rotationDays: 30 },
  session: { strategy: "database", ttlMinutes: 60, rolling: true },
  adapter: createMemoryAdapter(),
});
```

## Quick start (demo)

1. Install `@easyauth-js/core`.
2. Initialize config with `createConfig` and `createMemoryAdapter`.
3. Implement a simple flow using your adapter (e.g., create a user and session).

```ts
import { createConfig, createMemoryAdapter } from "@easyauth-js/core";

const adapter = createMemoryAdapter();
const config = createConfig({
  baseUrl: "http://localhost:3000",
  cookie: { sameSite: "lax" },
  jwt: { issuer: "demo", rotationDays: 30 },
  session: { strategy: "database", ttlMinutes: 60 },
  adapter,
});

const user = await adapter.createUser({ email: "demo@example.com" });
const session = await adapter.createSession({
  userId: user.id,
  expiresAt: new Date(Date.now() + 60 * 60 * 1000),
});
console.log({ user, session });
```

## Security Defaults (planned)

- Password hashing: Argon2id (fallback to tuned bcrypt)
- Token hygiene: short-lived email tokens, stored as HMAC-SHA-256 hashes
- Sessions: server-side opaque cookies by default; JWT optional (EdDSA/ES256)
- OAuth: Authorization Code + PKCE with strict redirect allowlist
- MFA: TOTP & WebAuthn in later phases

## Roadmap

1. Minimal runtime: email/password flows, CSRF/CORS, rate limiting
2. Next.js SDK: handlers, middleware, hooks, edge-compat
3. OAuth providers: Google, GitHub, Discord; account linking
4. DB adapters: Postgres (Prisma) first; others to follow
5. Self-hosted server + admin mini-UI
6. CLI, docs site, examples, cookbooks
7. Security hardening: MFA, session protections, audit

## Contributing

Contributions are welcome! This repo targets a modular structure with pnpm workspaces. Until tooling lands (Turborepo/Changesets), keep PRs scoped by package and include tests (Vitest) where applicable.

## License

MIT © Mark de Graaff
