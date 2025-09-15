EasyAuth Project Context

Vision
- Self-hosted auth system with Clerk-like DX and next-auth-like flexibility.
- Modular monorepo under the @easyauth-js/* scope.
- First-class Next.js and monorepo support, BYO database and email.

Repo Shape (Phases suggest pnpm workspaces)
- Monorepo: pnpm workspaces (Turborepo/Changesets later).
- Packages (planned):
  - @easyauth-js/core — core types, session engine, flows.
  - @easyauth-js/nextjs — Next.js SDK (App + Pages Router, middleware).
  - @easyauth-js/react — headless hooks + UI primitives.
  - @easyauth-js/express — thin wrapper for Node/Express/Fastify.
  - @easyauth-js/adapters-* — postgres, mysql, sqlite, mongo (prisma/drizzle).
  - @easyauth-js/providers-* — google, github, discord, etc.
  - @easyauth-js/email-* — smtp, ses, sendgrid, resend adapters.
  - @easyauth-js/cli — init, generate, migrate, dev server.
  - @easyauth-js/ui — optional widgets (unstyled + Tailwind set).
  - @easyauth-js/server — self-hosted service (API + admin).
  - @easyauth-js/examples/* — example apps.

Core Domain Model (Phase 1)
- Entities (minimum):
  - User
  - Account (OAuth)
  - Session
  - VerificationToken (email)
  - AuthKey (webauthn/totp)
  - AuditLog
- Adapter (DB-agnostic) contract covering CRUD for above plus audit.
- Deliverable: Types compile, adapter contract tests pass using in-memory mock.

Minimal Runtime (Phase 2)
- Email/password register, login, logout, getCurrentUser.
- CSRF and CORS strategy; rate limiting (in-mem/Redis).
- Password reset and email verify with short-lived one-time tokens.
- First adapter: Postgres + Prisma; seed + smoke tests.

Next.js SDK (Phase 3)
- Route handlers for App/Pages Router, middleware, server helpers, client hooks.
- Edge-compat for middleware using WebCrypto.
- Next.js example apps.

OAuth Providers (Phase 4)
- Provider framework with OIDC-first approach.
- Built-ins: Google, GitHub, Discord.
- PKCE + state; account linking by email.

Self-hosted Service (Phase 5)
- Fastify REST API for core auth flows + JWKS endpoint.
- Admin mini-UI (Next.js) for users/sessions/audit.
- Dockerfile, Compose, basic Helm; env-configurable.

DX Polish: CLI (Phase 6)
- init, migrate, dev; doctor checks; templates mirrored to examples/.

Adapters & Email (Phase 7)
- Postgres/MySQL/SQLite/Mongo adapters; smtp/ses/sendgrid/resend email.

Security Hardening (Phase 8)
- MFA (TOTP, WebAuthn), brute force defense, session hardening, CSRF, audit.

UI & Widgets (Phase 9)
- Headless + Tailwind components: SignIn, SignUp, UserButton, etc.; i18n, a11y.

Organizations & Roles (Phase 10)
- Orgs, memberships, invites, RBAC helpers, UI.

Observability & Ops (Phase 11)
- Logging, metrics, tracing, health/readiness.

Docs & Examples (Phase 12)
- Doc site, examples, cookbooks, migration guides, security guide.

Configuration Shape (single source of truth)
export type EasyAuthConfig = {
  baseUrl: string;
  cookie: { name?: string; sameSite?: 'lax'|'none'|'strict'; domain?: string; secure?: boolean };
  jwt: { issuer: string; audience?: string; rotationDays: number; alg?: 'RS256'|'ES256'|'EdDSA' };
  session: { strategy: 'database'|'jwt'; ttlMinutes: number; rolling?: boolean };
  email?: { sender: string; adapter: any };
  providers?: any[];
  mfa?: { totp?: boolean; webauthn?: boolean };
  rateLimit?: { windowSec: number; max: number; backend?: 'memory'|'redis' };
  features?: { organizations?: boolean; audit?: boolean };
  adapter: any;
  logger?: any;
};

Crypto Choices (ship-with defaults)
- Passwords: Argon2id (RFC 9106). Target ~100–250 ms, memory ~64–256 MiB; pepper optional. Fallback: bcrypt tuned to similar latency.
- Tokens (email verify/reset): 128-bit random, store only HMAC-SHA-256 hash, TTL 10–15 min, single-use.
- Sessions: Prefer server-side DB sessions with opaque HttpOnly Secure cookie (__Host- prefix when possible). If JWT: EdDSA (Ed25519) or ES256, rotate every 30–90 days, JWKS published.
- AEAD: XChaCha20-Poly1305 (libsodium) or AES-256-GCM; derive subkeys with HKDF-SHA-256; use KMS/HSM for master keys.
- TLS: TLS 1.3 preferred; modern ciphers (AES_128_GCM or CHACHA20_POLY1305).
- OAuth: Authorization Code + PKCE (S256) with state and strict redirect allowlist.
- WebAuthn: Level 2/3, RP ID enforcement, counters checked, UV preferred.

Security “don’t use”
- SHA-1/MD5, custom crypto, long-lived bearer JWTs without rotation, RSA-PKCS1v1.5, ECB/CTR without MAC, OAuth without PKCE for public clients.

MVP Next.js Integration (target DX)
- createNextHandler + middleware + <SignIn/> drop-in; Postgres adapter; Google provider; dev email adapter.

Competitor references (for API/DX inspiration only)
- Clerk: https://github.com/clerk/javascript
- NextAuth: https://github.com/nextauthjs/next-auth/tree/v4
- Better Auth: https://github.com/better-auth/better-auth

