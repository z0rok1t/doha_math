/**
 * Sanitises the `from` query parameter used as a post-sign-in destination.
 *
 * `from` is attacker-controlled, so it is never handed to signIn() as-is —
 * that is a textbook open redirect. Only an in-app admin path is honoured;
 * anything else falls back to /admin.
 *
 * Kept as a standalone pure module so it can be exercised directly.
 */
export function safeReturnTo(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate) return "/admin";
  // Protocol-relative ("//evil.com") and anything carrying a scheme.
  if (candidate.startsWith("//") || candidate.includes(":")) return "/admin";
  if (candidate.startsWith("\\")) return "/admin";
  // Exactly /admin, or a path beneath it. A bare prefix check would let
  // "/adminevil" through — harmless, but not a real destination.
  if (candidate !== "/admin" && !candidate.startsWith("/admin/")) {
    return "/admin";
  }
  return candidate;
}
