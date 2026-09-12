/**
 * Who may use the admin panel.
 *
 * Either identifier is accepted. A GitHub account can keep its email private,
 * and the email it signs commits with is often not its primary address — so
 * relying on email alone makes "not on the allowlist" a common and baffling
 * first-run failure. A username is stable and visible.
 *
 * Fails closed: if neither list is configured, nobody gets in.
 *
 * A standalone pure module so this check can be exercised directly — it is the
 * one piece of logic standing between the internet and write access to the
 * content repository.
 */

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowed(
  { email, login }: { email?: string | null; login?: string | null },
  // Injectable so the check can be exercised without mutating the process.
  env: Record<string, string | undefined> = process.env,
): boolean {
  const emails = parseList(env.ADMIN_EMAILS);
  const logins = parseList(env.ADMIN_LOGINS);

  if (emails.length === 0 && logins.length === 0) return false;
  if (email && emails.includes(email.trim().toLowerCase())) return true;
  if (login && logins.includes(login.trim().toLowerCase())) return true;
  return false;
}
