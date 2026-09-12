import "server-only";
import { problemSchema } from "@/lib/schemas";
import type { Problem } from "@/lib/types";
import {
  listRepoDir,
  problemPath,
  readRepoFile,
  REPO_PATHS,
} from "@/lib/admin/repo";

/** A problem as it exists on the branch, with the SHA needed to update it. */
export type RepoProblem = {
  problem: Problem;
  /** Blob SHA — pass back on save so a concurrent edit is detected. */
  sha: string;
  path: string;
};

/** A content file that could not be parsed. Surfaced rather than swallowed. */
export type RepoProblemIssue = { path: string; message: string };

function describe(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function parseProblem(text: string): Problem {
  // Throws on malformed JSON or a schema violation; the caller collects it.
  const parsed: unknown = JSON.parse(text);
  const result = problemSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(issues);
  }
  return result.data;
}

/**
 * Every problem on the branch, drafts included, newest first.
 *
 * Files that fail to parse are returned separately instead of being dropped —
 * a problem that silently vanished from the panel would be far more confusing
 * than one listed with its error.
 */
export async function loadRepoProblems(token: string): Promise<{
  problems: RepoProblem[];
  issues: RepoProblemIssue[];
}> {
  const entries = (await listRepoDir(REPO_PATHS.problems, token)).filter(
    (entry) => entry.name.endsWith(".json"),
  );

  const problems: RepoProblem[] = [];
  const issues: RepoProblemIssue[] = [];

  const files = await Promise.all(
    entries.map(async (entry) => ({
      entry,
      file: await readRepoFile(entry.path, token),
    })),
  );

  for (const { entry, file } of files) {
    if (!file) {
      issues.push({ path: entry.path, message: "could not be read" });
      continue;
    }
    try {
      problems.push({
        problem: parseProblem(file.text),
        sha: file.sha,
        path: file.path,
      });
    } catch (error) {
      issues.push({ path: entry.path, message: describe(error) });
    }
  }

  problems.sort((a, b) =>
    b.problem.publishedAt.localeCompare(a.problem.publishedAt),
  );
  return { problems, issues };
}

/** One problem by slug, or null when there is no such file. */
export async function loadRepoProblem(
  slug: string,
  token: string,
): Promise<RepoProblem | null> {
  const file = await readRepoFile(problemPath(slug), token);
  if (!file) return null;
  return {
    problem: parseProblem(file.text),
    sha: file.sha,
    path: file.path,
  };
}

/** The next unused problem number, for prefilling a new problem. */
export function nextProblemNumber(problems: RepoProblem[]): number {
  return problems.reduce((max, { problem }) => Math.max(max, problem.number), 0) + 1;
}
