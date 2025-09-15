import { createHash, randomBytes } from "node:crypto";

export interface OAuthUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
}

export interface OAuthProvider {
  id: "google" | "github" | string;
  discoveryUrl?: string;
  authorization: { url: string; params: Record<string, string> };
  token: { url: string };
  userinfo?: { url: string; map: (raw: unknown) => OAuthUser };
  profile?(tokens: unknown, raw: unknown): Promise<Partial<OAuthUser>>;
}

export function generateState(length = 32): string {
  return randomBytes(length).toString("hex");
}

export function generatePkce(length = 43): { verifier: string; challenge: string } {
  const verifier = randomBytes(length).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function buildAuthorizationUrl(
  provider: OAuthProvider,
  opts: { clientId: string; redirectUri: string; scope?: string[] },
): { url: string; state: string; verifier: string } {
  const state = generateState();
  const { verifier, challenge } = generatePkce();
  const url = new URL(provider.authorization.url);
  for (const [k, v] of Object.entries(provider.authorization.params)) {
    url.searchParams.set(k, v);
  }
  url.searchParams.set("client_id", opts.clientId);
  url.searchParams.set("redirect_uri", opts.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  if (opts.scope) {
    url.searchParams.set("scope", opts.scope.join(" "));
  }
  return { url: url.toString(), state, verifier };
}

export * as google from "@easyauth-js/providers-google";
export * as github from "@easyauth-js/providers-github";
export * as discord from "@easyauth-js/providers-discord";
