import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAllowed } from "@/lib/admin/allowlist";

export type AdminSession = {
  email: string;
  login?: string;
  /** GitHub OAuth token, used to commit content as this person. */
  githubToken: string;
};

/**
 * THE SECURITY BOUNDARY.
 *
 * Every admin page loader and every Server Action must call this. `proxy.ts`
 * only redirects unauthenticated browsers for the sake of the UX — it runs on
 * prefetches and is not a guarantee. Per the Next.js auth guidance, a Server
 * Action is a public endpoint and has to verify for itself.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await auth();
  const email = session?.user?.email ?? null;
  const login = session?.githubLogin ?? null;

  // No session at all: send them to sign in. src/proxy.ts normally catches
  // this first, but a page must not depend on the proxy having run — this is
  // also what turns a missing session into a redirect instead of a 500.
  if (!email && !login) redirect("/login");

  // Signed in but not on the allowlist. Not a redirect: they are authenticated
  // and looping them back to sign-in would be confusing.
  if (!isAllowed({ email, login })) {
    throw new Error(
      `${login ? `@${login}` : email} is not on the admin allowlist.`,
    );
  }
  if (!session?.githubToken) {
    // The session predates the GitHub scope, or the token was revoked.
    throw new Error("No GitHub token on this session — sign out and back in.");
  }

  return {
    email: email ?? `@${login}`,
    login: login ?? undefined,
    githubToken: session.githubToken,
  };
}

/**
 * Non-throwing variant, for rendering "signed in as" chrome.
 *
 * Reads the session directly rather than wrapping requireAdmin(), because
 * requireAdmin() can call redirect(), and redirect() signals by throwing — a
 * try/catch around it would swallow the redirect.
 */
export async function getAdmin(): Promise<AdminSession | null> {
  const session = await auth();
  const email = session?.user?.email ?? null;
  const login = session?.githubLogin ?? null;
  if (!isAllowed({ email, login }) || !session?.githubToken) return null;
  return {
    email: email ?? `@${login}`,
    login: login ?? undefined,
    githubToken: session.githubToken,
  };
}
