import type { Account, AuditEvent, Session, User, VerificationToken } from "./types";

export interface Adapter {
  // Users
  createUser(data: Partial<User>): Promise<User>;
  getUser(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;

  // Accounts (OAuth)
  linkAccount(acc: Account): Promise<Account>;
  getAccountByProvider(provider: string, providerAccountId: string): Promise<Account | null>;

  // Sessions
  createSession(s: Omit<Session, "id" | "createdAt" | "updatedAt">): Promise<Session>;
  getSession(id: string): Promise<Session | null>;
  deleteSession(id: string): Promise<void>;

  // Tokens (email verify, password reset)
  createVerificationToken(v: VerificationToken): Promise<VerificationToken>;
  useVerificationToken(identifier: string, token: string): Promise<VerificationToken | null>;

  // Audit
  appendAudit(event: { type: string; userId?: string; ip?: string; meta?: unknown }): Promise<void>;
}

export type AdapterFactory<TConfig = unknown> = (config: TConfig) => Adapter;
