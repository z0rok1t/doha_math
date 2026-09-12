import "server-only";

/**
 * The admin panel's data layer: read and write `content/` and `public/` through
 * the GitHub Contents API, as the signed-in person.
 *
 * Why not read the local filesystem like the public site does? Because
 * immediately after a save the running deployment is still the *previous*
 * build. A filesystem read would hand the editor stale content and look as
 * though their save had been lost. Reading the branch is always current.
 *
 * Only three endpoints are used, so this is plain fetch rather than a GitHub
 * SDK.
 */

const API = "https://api.github.com";

export type RepoFile = {
  path: string;
  /** Blob SHA. Must be sent back on update — this is the concurrency guard. */
  sha: string;
  text: string;
};

export type RepoEntry = { name: string; path: string; sha: string };

export type CommitResult = { commitUrl: string; sha: string };

type RepoConfig = { owner: string; name: string; branch: string };

/** Distinguishes the failures the UI needs to phrase differently. */
export type RepoErrorKind =
  | "config"
  | "auth"
  | "scope"
  | "rate-limit"
  | "conflict"
  | "not-found"
  | "unknown";

export class RepoError extends Error {
  // Assigned in the body rather than as a constructor parameter property:
  // parameter properties are TypeScript-only syntax that needs transforming,
  // not just type-erasing, so plain type-stripping runtimes reject them.
  readonly kind: RepoErrorKind;

  constructor(kind: RepoErrorKind, message: string) {
    super(message);
    this.name = "RepoError";
    this.kind = kind;
  }
}

function repoConfig(): RepoConfig {
  const slug = process.env.GITHUB_REPO;
  if (!slug || !slug.includes("/")) {
    throw new RepoError(
      "config",
      'GITHUB_REPO is not set. It must look like "owner/repo".',
    );
  }
  const [owner, name] = slug.split("/");
  if (!owner || !name) {
    throw new RepoError("config", `GITHUB_REPO is malformed: "${slug}".`);
  }
  return { owner, name, branch: process.env.GITHUB_BRANCH ?? "main" };
}

async function describeFailure(
  response: Response,
  context: string,
): Promise<RepoError> {
  let detail = "";
  try {
    const body = (await response.json()) as { message?: string };
    detail = body.message ? ` (${body.message})` : "";
  } catch {
    // no JSON body
  }

  switch (response.status) {
    case 401:
      return new RepoError(
        "auth",
        `GitHub rejected the sign-in token. Sign out and back in.${detail}`,
      );
    case 403:
      if (response.headers.get("x-ratelimit-remaining") === "0") {
        return new RepoError(
          "rate-limit",
          "GitHub's API rate limit is exhausted. Try again in a few minutes.",
        );
      }
      return new RepoError(
        "scope",
        `GitHub refused the request — the sign-in scope probably cannot write to this repository. A private repo needs GITHUB_OAUTH_SCOPE=repo.${detail}`,
      );
    case 404:
      return new RepoError(
        "not-found",
        `${context} was not found. Check GITHUB_REPO and GITHUB_BRANCH.${detail}`,
      );
    case 409:
      return new RepoError(
        "conflict",
        `The branch moved while saving. Reload and try again.${detail}`,
      );
    case 422:
      return new RepoError(
        "conflict",
        `This file changed since you loaded it, so the save was refused rather than overwriting someone else's edit. Reload and reapply your changes.${detail}`,
      );
    default:
      return new RepoError(
        "unknown",
        `GitHub returned ${response.status} for ${context}.${detail}`,
      );
  }
}

async function request(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    // Content must never be served from a cache — the panel needs the live
    // state of the branch.
    cache: "no-store",
  });
}

/** Returns null when the file does not exist, rather than throwing. */
export async function readRepoFile(
  filePath: string,
  token: string,
): Promise<RepoFile | null> {
  const { owner, name, branch } = repoConfig();
  const response = await request(
    `/repos/${owner}/${name}/contents/${encodeURI(filePath)}?ref=${encodeURIComponent(branch)}`,
    token,
  );

  if (response.status === 404) return null;
  if (!response.ok) throw await describeFailure(response, filePath);

  const body = (await response.json()) as {
    sha: string;
    content?: string;
    encoding?: string;
  };
  if (!body.content || body.encoding !== "base64") {
    throw new RepoError(
      "unknown",
      `${filePath} did not come back as base64 content — it may be too large or a directory.`,
    );
  }

  return {
    path: filePath,
    sha: body.sha,
    text: Buffer.from(body.content, "base64").toString("utf8"),
  };
}

export async function listRepoDir(
  dirPath: string,
  token: string,
): Promise<RepoEntry[]> {
  const { owner, name, branch } = repoConfig();
  const response = await request(
    `/repos/${owner}/${name}/contents/${encodeURI(dirPath)}?ref=${encodeURIComponent(branch)}`,
    token,
  );

  if (response.status === 404) return [];
  if (!response.ok) throw await describeFailure(response, dirPath);

  const body = (await response.json()) as Array<{
    name: string;
    path: string;
    sha: string;
    type: string;
  }>;
  if (!Array.isArray(body)) {
    throw new RepoError("unknown", `${dirPath} is a file, not a directory.`);
  }
  return body
    .filter((entry) => entry.type === "file")
    .map(({ name: entryName, path, sha }) => ({ name: entryName, path, sha }));
}

/**
 * Creates or updates a file. Omit `sha` to create; pass the SHA you read to
 * update. A stale SHA is rejected by GitHub, which is exactly what stops two
 * editors silently overwriting each other.
 */
export async function commitFile({
  path: filePath,
  base64,
  sha,
  message,
  token,
}: {
  path: string;
  base64: string;
  sha?: string;
  message: string;
  token: string;
}): Promise<CommitResult> {
  const { owner, name, branch } = repoConfig();
  const response = await request(
    `/repos/${owner}/${name}/contents/${encodeURI(filePath)}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({ message, content: base64, branch, sha }),
    },
  );

  if (!response.ok) throw await describeFailure(response, filePath);

  const body = (await response.json()) as {
    commit: { sha: string; html_url: string };
    content: { sha: string };
  };
  return { commitUrl: body.commit.html_url, sha: body.content.sha };
}

/** Convenience wrapper for UTF-8 text (JSON content files, SVG diagrams). */
export async function commitText(options: {
  path: string;
  text: string;
  sha?: string;
  message: string;
  token: string;
}): Promise<CommitResult> {
  const { text, ...rest } = options;
  return commitFile({
    ...rest,
    base64: Buffer.from(text, "utf8").toString("base64"),
  });
}

export async function deleteRepoFile({
  path: filePath,
  sha,
  message,
  token,
}: {
  path: string;
  sha: string;
  message: string;
  token: string;
}): Promise<CommitResult> {
  const { owner, name, branch } = repoConfig();
  const response = await request(
    `/repos/${owner}/${name}/contents/${encodeURI(filePath)}`,
    token,
    {
      method: "DELETE",
      body: JSON.stringify({ message, sha, branch }),
    },
  );

  if (!response.ok) throw await describeFailure(response, filePath);

  const body = (await response.json()) as {
    commit: { sha: string; html_url: string };
  };
  return { commitUrl: body.commit.html_url, sha: body.commit.sha };
}

/** Where the panel writes. Kept here so paths are defined in one place. */
export const REPO_PATHS = {
  problems: "content/problems",
  challenges: "content/challenges",
  daily: "content/daily.json",
  site: "content/site.json",
  figures: "public/problems",
} as const;

export function problemPath(slug: string): string {
  return `${REPO_PATHS.problems}/${slug}.json`;
}

export function challengePath(slug: string): string {
  return `${REPO_PATHS.challenges}/${slug}.json`;
}
