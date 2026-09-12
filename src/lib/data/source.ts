import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";
import {
  challengeSchema,
  dailyScheduleSchema,
  problemSchema,
  siteContentSchema,
} from "@/lib/schemas";
import type {
  Challenge,
  DailySchedule,
  Problem,
  SiteContent,
} from "@/lib/types";

/**
 * THE SWAP SEAM.
 *
 * This is the only module in the app that reads the filesystem. Everything
 * else goes through the accessors in `src/lib/data/*`, which are all async.
 * To move to a database or headless CMS later, reimplement the four `load*`
 * functions below to query it — no component or page needs to change.
 *
 * TODO: when a real backend lands, `solveCount` should come from it rather
 * than from the content file, since it changes constantly.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");
const PUBLIC_DIR = path.join(process.cwd(), "public");

async function readJson<T>(relPath: string, schema: z.ZodType<T>): Promise<T> {
  const absPath = path.join(CONTENT_DIR, relPath);

  let raw: string;
  try {
    raw = await readFile(absPath, "utf8");
  } catch {
    throw new Error(`Missing content file: content/${relPath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      `content/${relPath} is not valid JSON: ${(error as Error).message}`,
    );
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const where = issue.path.length ? issue.path.join(".") : "(root)";
        return `  - ${where}: ${issue.message}`;
      })
      .join("\n");
    throw new Error(`content/${relPath} failed validation:\n${issues}`);
  }

  return result.data;
}

async function readJsonDir<T>(
  dirName: string,
  schema: z.ZodType<T>,
): Promise<T[]> {
  let names: string[];
  try {
    names = await readdir(path.join(CONTENT_DIR, dirName));
  } catch {
    throw new Error(`Missing content directory: content/${dirName}`);
  }
  const files = names.filter((name) => name.endsWith(".json")).sort();
  return Promise.all(files.map((file) => readJson(`${dirName}/${file}`, schema)));
}

/**
 * Caches the parsed result in production so a page render doesn't re-read and
 * re-validate the same files. Left uncached in development so editing a
 * content file shows up on refresh without restarting the dev server.
 */
function memoize<T>(load: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | null = null;
  return () => {
    if (process.env.NODE_ENV !== "production") return load();
    cached ??= load();
    return cached;
  };
}

function assertUnique<T>(
  items: T[],
  key: (item: T) => string | number,
  label: string,
): void {
  const seen = new Map<string | number, number>();
  for (const item of items) {
    const value = key(item);
    seen.set(value, (seen.get(value) ?? 0) + 1);
  }
  const duplicates = [...seen.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value);
  if (duplicates.length) {
    throw new Error(
      `Duplicate problem ${label}(s) in content/problems: ${duplicates.join(", ")}`,
    );
  }
}

/**
 * A figure's `src` points at a file under `public/`. Checking it here means a
 * typo'd path fails the build with the problem's name, instead of shipping a
 * page with a broken image on it.
 */
async function assertFiguresExist(problems: Problem[]): Promise<void> {
  const missing: string[] = [];
  await Promise.all(
    problems.map(async (problem) => {
      if (!problem.figure) return;
      const file = path.join(PUBLIC_DIR, problem.figure.src);
      try {
        await access(file);
      } catch {
        missing.push(`${problem.slug} -> public${problem.figure.src}`);
      }
    }),
  );
  if (missing.length) {
    const list = missing.map((entry) => `  - ${entry}`).join("\n");
    throw new Error(
      `Problem figures point at files that do not exist:\n${list}`,
    );
  }
}

const loadEveryProblem = memoize(async (): Promise<Problem[]> => {
  const problems = await readJsonDir("problems", problemSchema);
  assertUnique(problems, (p) => p.slug, "slug");
  assertUnique(problems, (p) => p.number, "number");
  await assertFiguresExist(problems);
  // Newest first — the order every listing starts from.
  return problems.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
});

/**
 * Published problems only — everything the public site renders.
 *
 * The draft filter lives here, at the seam, rather than in each accessor. That
 * way `getAllProblems`, `getTopicCounts`, `getProblemVideos`,
 * `generateStaticParams` and every future accessor are draft-safe without
 * changing a single call site, and forgetting to filter is not possible.
 */
export async function loadProblems(): Promise<Problem[]> {
  const problems = await loadEveryProblem();
  return problems.filter((problem) => problem.status === "published");
}

/** Includes drafts. For the admin panel only — never for a public page. */
export async function loadProblemsIncludingDrafts(): Promise<Problem[]> {
  return loadEveryProblem();
}

export const loadChallenges = memoize(async (): Promise<Challenge[]> => {
  const challenges = await readJsonDir("challenges", challengeSchema);
  // Most recent first.
  return challenges.sort((a, b) => b.opensAt.localeCompare(a.opensAt));
});

export const loadDailySchedule = memoize((): Promise<DailySchedule> =>
  readJson("daily.json", dailyScheduleSchema),
);

export const loadSiteContent = memoize((): Promise<SiteContent> =>
  readJson("site.json", siteContentSchema),
);
