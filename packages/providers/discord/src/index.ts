import type { OAuthProvider, OAuthUser } from "@easyauth-js/providers";

export const provider: OAuthProvider = {
  id: "discord",
  authorization: {
    url: "https://discord.com/api/oauth2/authorize",
    params: {
      scope: "openid email identify",
      prompt: "consent",
    },
  },
  token: { url: "https://discord.com/api/oauth2/token" },
  userinfo: {
    url: "https://discord.com/api/users/@me",
    map: (raw: unknown) => {
      const r = raw as {
        id?: string;
        email?: string;
        username?: string;
        avatar?: string;
      };
      const user: OAuthUser = { id: String(r.id) };
      if (r.email) {
        user.email = r.email;
      }
      if (r.username) {
        user.name = r.username;
      }
      if (r.avatar) {
        user.image = `https://cdn.discordapp.com/avatars/${r.id}/${r.avatar}.png`;
      }
      return user;
    },
  },
};

export default provider;
