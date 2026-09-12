import NextAuth, { type Profile } from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Auth for /admin.
 *
 * GitHub is the provider rather than Google because the same OAuth token is
 * used to commit content: edits are then attributed to the real person in git
 * history, and there is no long-lived personal access token sitting in an env
 * var. The token rides in the session cookie, which Auth.js encrypts (JWE) and
 * sets httpOnly.
 *
 * Access is gated twice, on purpose:
 *   1. the `signIn` callback here, so a non-allowlisted account never even
 *      receives a session;
 *   2. `requireAdmin()` in src/lib/admin/guard.ts, called by every admin page
 *      and every Server Action — that is the actual security boundary.
 */

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

const ADMIN_EMAILS = parseList(process.env.ADMIN_EMAILS);
const ADMIN_LOGINS = parseList(process.env.ADMIN_LOGINS);

/**
 * Who may use the panel.
 *
 * Either identifier is accepted. A GitHub account can keep its email private,
 * and the email it signs commits with is often not its primary address — so
 * relying on email alone makes "not on the allowlist" a common and baffling
 * first-run failure. A username is stable and visible.
 *
 * Fails closed: if neither list is configured, nobody gets in.
 */
export function isAdminIdentity({
  email,
  login,
}: {
  email?: string | null;
  login?: string | null;
}): boolean {
  if (ADMIN_EMAILS.length === 0 && ADMIN_LOGINS.length === 0) return false;
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) return true;
  if (login && ADMIN_LOGINS.includes(login.toLowerCase())) return true;
  return false;
}

type GitHubEmail = { email: string; primary: boolean; verified: boolean };

/**
 * GitHub omits `email` from the profile when the account keeps it private, so
 * fall back to the emails endpoint (needs the `user:email` scope). Only a
 * verified address is accepted — an unverified one proves nothing.
 */
async function resolveEmail(
  profile: Profile | undefined,
  accessToken: string | undefined,
): Promise<string | null> {
  if (typeof profile?.email === "string" && profile.email) return profile.email;
  if (!accessToken) return null;

  const response = await fetch("https://api.github.com/user/emails", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!response.ok) return null;

  const emails = (await response.json()) as GitHubEmail[];
  const chosen =
    emails.find((entry) => entry.primary && entry.verified) ??
    emails.find((entry) => entry.verified);
  return chosen?.email ?? null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      authorization: {
        params: {
          // `public_repo` suffices for a public repository; a private one needs
          // the broader `repo`. Configurable so switching doesn't need a code
          // change. OAuth apps cannot request fine-grained repo access — a
          // GitHub App could, and is the upgrade path if this scope is too wide.
          scope: `read:user user:email ${process.env.GITHUB_OAUTH_SCOPE ?? "public_repo"}`,
        },
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ account, profile }) {
      const login = typeof profile?.login === "string" ? profile.login : null;
      // Skip the extra email lookup when the username alone already qualifies.
      if (isAdminIdentity({ login })) return true;
      const email = await resolveEmail(profile, account?.access_token);
      return isAdminIdentity({ email, login });
    },
    async jwt({ token, account, profile }) {
      // `account` is only present on the initial sign-in.
      if (account) {
        token.githubToken = account.access_token;
        token.githubLogin =
          typeof profile?.login === "string" ? profile.login : undefined;
        const email = await resolveEmail(profile, account.access_token);
        if (email) token.email = email;
      }
      return token;
    },
    async session({ session, token }) {
      // JWT fields come back as `unknown` (see src/types/next-auth.d.ts).
      if (typeof token.githubToken === "string") {
        session.githubToken = token.githubToken;
      }
      if (typeof token.githubLogin === "string") {
        session.githubLogin = token.githubLogin;
      }
      if (typeof token.email === "string") {
        session.user.email = token.email;
      }
      return session;
    },
  },
});
