export type User = {
  id: string;
  email: string | null;
  emailVerified?: Date | null;
  name?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Account = {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenType?: string | null;
  expiresAt?: number | null; // seconds epoch
};

export type Session = {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type VerificationToken = {
  id: string;
  identifier: string; // email or other identifier
  token: string; // raw token or hash, per adapter implementation
  expiresAt: Date;
};

export type AuthKey = {
  id: string;
  userId: string;
  type: "webauthn" | "totp";
  publicKey?: string; // webauthn
  counter?: number; // webauthn device counter
  label?: string;
  createdAt: Date;
};

export type AuditEvent = {
  id?: string;
  type: string;
  userId?: string;
  ip?: string;
  meta?: unknown;
  createdAt?: Date;
};

