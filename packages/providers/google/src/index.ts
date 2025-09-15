import type { OAuthProvider, OAuthUser } from "@easyauth-js/providers";

export const provider: OAuthProvider = {
  id: "google",
  discoveryUrl: "https://accounts.google.com/.well-known/openid-configuration",
  authorization: {
    url: "https://accounts.google.com/o/oauth2/v2/auth",
    params: {
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    },
  },
  token: { url: "https://oauth2.googleapis.com/token" },
  userinfo: {
    url: "https://openidconnect.googleapis.com/v1/userinfo",
    map: (raw: unknown) => {
      const r = raw as {
        sub?: string;
        email?: string;
        name?: string;
        picture?: string;
      };
      const user: OAuthUser = { id: String(r.sub) };
      if (r.email) {
        user.email = r.email;
      }
      if (r.name) {
        user.name = r.name;
      }
      if (r.picture) {
        user.image = r.picture;
      }
      return user;
    },
  },
};

export default provider;
