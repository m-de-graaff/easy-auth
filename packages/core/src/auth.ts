import { scrypt as _scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Adapter } from "./adapter";
import type { Session, User } from "./types";

const scrypt = promisify(_scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(":");
  if (!salt || !key) {
    return false;
  }
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const keyBuf = Buffer.from(key, "hex");
  return keyBuf.length === derived.length && timingSafeEqual(keyBuf, derived);
}

export async function register(adapter: Adapter, email: string, password: string): Promise<User> {
  const existing = await adapter.getUserByEmail(email);
  if (existing) {
    throw new Error("User already exists");
  }
  const user = await adapter.createUser({ email });
  const passwordHash = await hashPassword(password);
  await adapter.linkAccount({
    id: "",
    userId: user.id,
    provider: "credentials",
    providerAccountId: email,
    passwordHash,
  });
  return user;
}

export async function login(
  adapter: Adapter,
  email: string,
  password: string,
): Promise<{ user: User; session: Session }> {
  const user = await adapter.getUserByEmail(email);
  const account = await adapter.getAccountByProvider("credentials", email);
  if (!user || !account?.passwordHash) {
    throw new Error("Invalid credentials");
  }
  const valid = await verifyPassword(password, account.passwordHash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }
  const session = await adapter.createSession({
    userId: user.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });
  return { user, session };
}

export async function logout(adapter: Adapter, sessionId: string): Promise<void> {
  await adapter.deleteSession(sessionId);
}

export async function getCurrentUser(adapter: Adapter, sessionId: string): Promise<User | null> {
  const session = await adapter.getSession(sessionId);
  if (!session || session.expiresAt.getTime() < Date.now()) {
    return null;
  }
  return adapter.getUser(session.userId);
}

export type OAuthProfile = {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

export async function oauthLogin(
  adapter: Adapter,
  provider: string,
  profile: OAuthProfile,
): Promise<{ user: User; session: Session }> {
  let user: User | null = null;
  if (profile.email) {
    user = await adapter.getUserByEmail(profile.email);
  }
  if (!user) {
    user = await adapter.createUser({
      email: profile.email ?? null,
      name: profile.name ?? null,
      image: profile.image ?? null,
    });
  }
  await adapter.linkAccount({
    id: "",
    userId: user.id,
    provider,
    providerAccountId: profile.id,
    accessToken: null,
    refreshToken: null,
    tokenType: null,
    expiresAt: null,
  });
  const session = await adapter.createSession({
    userId: user.id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });
  return { user, session };
}
