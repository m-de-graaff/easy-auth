import type { Adapter } from './adapter';

export type EasyAuthConfig = {
  baseUrl: string;
  cookie: {
    name?: string;
    sameSite?: 'lax' | 'none' | 'strict';
    domain?: string;
    secure?: boolean;
  };
  jwt: {
    issuer: string;
    audience?: string;
    rotationDays: number;
    alg?: 'RS256' | 'ES256' | 'EdDSA';
  };
  session: {
    strategy: 'database' | 'jwt';
    ttlMinutes: number;
    rolling?: boolean;
  };
  email?: { sender: string; adapter: unknown };
  providers?: unknown[];
  mfa?: { totp?: boolean; webauthn?: boolean };
  rateLimit?: { windowSec: number; max: number; backend?: 'memory' | 'redis' };
  features?: { organizations?: boolean; audit?: boolean };
  adapter: Adapter;
  logger?: {
    debug?: (...args: unknown[]) => void;
    info?: (...args: unknown[]) => void;
    warn?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
  };
};

export function createConfig(config: EasyAuthConfig): EasyAuthConfig {
  // minimal validation to start; full validator later
  if (!config.baseUrl) throw new Error('EasyAuth: baseUrl is required');
  if (!config.adapter) throw new Error('EasyAuth: adapter is required');
  return config;
}

