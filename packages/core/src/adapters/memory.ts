import { randomUUID } from 'node:crypto';
import type { Adapter } from '../adapter';
import type { Account, Session, User, VerificationToken } from '../types';

export function createMemoryAdapter(): Adapter {
  const users = new Map<string, User>();
  const usersByEmail = new Map<string, string>();
  const accounts = new Map<string, Account>(); // key: `${provider}:${providerAccountId}`
  const sessions = new Map<string, Session>();
  const verificationTokens = new Map<string, VerificationToken>(); // key: `${identifier}:${token}`

  return {
    async createUser(data) {
      const now = new Date();
      const id = data.id ?? randomUUID();
      const user: User = {
        id,
        email: data.email ?? null,
        emailVerified: data.emailVerified ?? null,
        name: data.name ?? null,
        image: data.image ?? null,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
      };
      users.set(id, user);
      if (user.email) usersByEmail.set(user.email.toLowerCase(), id);
      return user;
    },

    async getUser(id) {
      return users.get(id) ?? null;
    },

    async getUserByEmail(email) {
      const id = usersByEmail.get(email.toLowerCase());
      return id ? users.get(id)! : null;
    },

    async updateUser(id, data) {
      const existing = users.get(id);
      if (!existing) throw new Error('User not found');
      const next: User = {
        ...existing,
        ...data,
        updatedAt: new Date(),
      };
      users.set(id, next);
      if (existing.email && existing.email !== next.email) {
        usersByEmail.delete(existing.email.toLowerCase());
      }
      if (next.email) usersByEmail.set(next.email.toLowerCase(), id);
      return next;
    },

    async linkAccount(acc) {
      const normalized: Account = { ...(acc as Account) } as Account;
      if (!normalized.id) normalized.id = randomUUID();
      const key = `${normalized.provider}:${normalized.providerAccountId}`;
      accounts.set(key, normalized);
      return normalized;
    },

    async getAccountByProvider(provider, providerAccountId) {
      const key = `${provider}:${providerAccountId}`;
      return accounts.get(key) ?? null;
    },

    async createSession(s) {
      const now = new Date();
      const session: Session = {
        id: randomUUID(),
        userId: s.userId,
        expiresAt: s.expiresAt,
        createdAt: now,
        updatedAt: now,
      };
      sessions.set(session.id, session);
      return session;
    },

    async getSession(id) {
      return sessions.get(id) ?? null;
    },

    async deleteSession(id) {
      sessions.delete(id);
    },

    async createVerificationToken(v) {
      const token: VerificationToken = { ...(v as VerificationToken) } as VerificationToken;
      if (!token.id) token.id = randomUUID();
      const key = `${token.identifier}:${token.token}`;
      verificationTokens.set(key, token);
      return token;
    },

    async useVerificationToken(identifier, token) {
      const key = `${identifier}:${token}`;
      const found = verificationTokens.get(key) ?? null;
      if (!found) return null;
      verificationTokens.delete(key); // single-use
      if (found.expiresAt.getTime() < Date.now()) return null;
      return found;
    },

    async appendAudit(_event) {
      // no-op for memory adapter; later phases can persist/emit
    },
  };
}
