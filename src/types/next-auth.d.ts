import type { DefaultSession } from "next-auth";

/**
 * The GitHub OAuth token and login are carried on the session so Server
 * Actions can commit as the signed-in person. See src/auth.ts for why.
 *
 * Only Session is augmented. The JWT interface lives in @auth/core/jwt and
 * extends Record<string, unknown>, so its fields read back as `unknown`;
 * src/auth.ts narrows them with typeof checks instead of augmenting a
 * transitive package whose layout shifts between beta releases.
 */
declare module "next-auth" {
  interface Session {
    githubToken?: string;
    githubLogin?: string;
    user: DefaultSession["user"];
  }
}
