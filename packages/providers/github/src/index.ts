import type { OAuthProvider, OAuthUser } from "@easyauth-js/providers";

export const provider: OAuthProvider = {
  id: "github",
  authorization: {
    url: "https://github.com/login/oauth/authorize",
    params: {
      scope: "read:user user:email",
    },
  },
  token: { url: "https://github.com/login/oauth/access_token" },
  userinfo: {
    url: "https://api.github.com/user",
    map: (raw: unknown) => {
      const r = raw as {
        id?: string | number;
        email?: string;
        name?: string;
        avatar_url?: string;
      };
      const user: OAuthUser = { id: String(r.id) };
      if (r.email) {
        user.email = r.email;
      }
      if (r.name) {
        user.name = r.name;
      }
      if (r.avatar_url) {
        user.image = r.avatar_url;
      }
      return user;
    },
  },
};

export default provider;
