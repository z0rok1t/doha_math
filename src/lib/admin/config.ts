/**
 * Is sign-in actually configured?
 *
 * Without this the login button happily redirects to
 * github.com/login/oauth/authorize with whatever client_id it was given —
 * and GitHub answers an unrecognised client_id with its own 404 page
 * ("this is not the web page you are looking for"). That looks like a broken
 * site rather than a missing setup step, so the panel checks first and
 * explains itself instead.
 *
 * Pure and env-injectable so it can be exercised directly.
 */

/** Values that are present but obviously not real credentials. */
const PLACEHOLDERS = new Set([
  "placeholder-client-id",
  "placeholder-client-secret",
  "changeme",
  "todo",
  "xxx",
]);

export type ConfigProblem = { key: string; message: string };

function missing(value: string | undefined): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return true;
  return PLACEHOLDERS.has(trimmed.toLowerCase());
}

export function authConfigProblems(
  env: Record<string, string | undefined> = process.env,
): ConfigProblem[] {
  const problems: ConfigProblem[] = [];

  if (missing(env.AUTH_GITHUB_ID)) {
    problems.push({
      key: "AUTH_GITHUB_ID",
      message: "The OAuth app's Client ID.",
    });
  }
  if (missing(env.AUTH_GITHUB_SECRET)) {
    problems.push({
      key: "AUTH_GITHUB_SECRET",
      message: "The OAuth app's generated client secret.",
    });
  }
  if (missing(env.AUTH_SECRET)) {
    problems.push({
      key: "AUTH_SECRET",
      message: "Session encryption key — generate one with: npx auth secret",
    });
  }
  if (missing(env.ADMIN_LOGINS) && missing(env.ADMIN_EMAILS)) {
    problems.push({
      key: "ADMIN_LOGINS",
      message:
        "Your GitHub username. With both allowlists empty, sign-in denies everyone by design.",
    });
  }
  if (missing(env.GITHUB_REPO) || !env.GITHUB_REPO?.includes("/")) {
    problems.push({
      key: "GITHUB_REPO",
      message: 'The repository the panel commits to, as "owner/repo".',
    });
  }

  return problems;
}

export function isAuthConfigured(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return authConfigProblems(env).length === 0;
}
