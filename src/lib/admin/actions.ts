"use server";

import { problemSchema } from "@/lib/schemas";
import { requireAdmin } from "@/lib/admin/guard";
import { loadRepoProblems } from "@/lib/admin/problems";
import {
  commitFile,
  commitText,
  deleteRepoFile,
  problemPath,
  readRepoFile,
  REPO_PATHS,
  RepoError,
} from "@/lib/admin/repo";

/**
 * Mutations for the admin panel.
 *
 * Every action calls requireAdmin() before touching anything. A Server Action
 * is a public HTTP endpoint — src/proxy.ts redirecting browsers is a UX
 * nicety, not access control, so the check has to live here too.
 *
 * Expected failures (validation, duplicate slug, concurrent edit) come back as
 * a result object so the form can render them. Only genuinely unexpected
 * problems throw.
 */

export type ActionResult =
  | {
      ok: true;
      slug: string;
      commitUrl: string;
      /** New blob SHA, so the editor can save again without reloading. */
      sha?: string;
    }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

function messageFor(error: unknown): string {
  if (error instanceof RepoError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

/** Stable, readable JSON — matches how the seed content is formatted. */
function serialise(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export async function saveProblem({
  data,
  originalSlug,
  sha,
}: {
  /** Raw form values; validated here, never trusted. */
  data: unknown;
  /** The slug the editor loaded, so a rename can be detected. Absent = new. */
  originalSlug?: string;
  /** Blob SHA the editor loaded. Absent = creating. */
  sha?: string;
}): Promise<ActionResult> {
  const { githubToken, login } = await requireAdmin();

  // 1. Validate with the same schema the build uses, so a save can never
  //    produce a file that breaks the site.
  const parsed = problemSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "form";
      fieldErrors[key] ??= issue.message;
    }
    return {
      ok: false,
      message: "Some fields need fixing before this can be saved.",
      fieldErrors,
    };
  }
  const problem = parsed.data;

  try {
    // 2. Uniqueness, the same rule the build enforces (assertUnique in
    //    src/lib/data/source.ts).
    const { problems } = await loadRepoProblems(githubToken);
    const others = problems.filter((entry) => entry.problem.slug !== originalSlug);

    if (others.some((entry) => entry.problem.slug === problem.slug)) {
      return {
        ok: false,
        message: `A problem with the slug "${problem.slug}" already exists.`,
        fieldErrors: { slug: "Already taken." },
      };
    }
    if (others.some((entry) => entry.problem.number === problem.number)) {
      return {
        ok: false,
        message: `Problem number ${problem.number} is already used.`,
        fieldErrors: { number: "Already used." },
      };
    }

    // 3. A figure must point at a file that exists, or the build will fail
    //    later — check now, while there is someone to tell.
    if (problem.figure) {
      const figure = await readRepoFile(
        `public${problem.figure.src}`,
        githubToken,
      );
      if (!figure) {
        return {
          ok: false,
          message: `No such diagram: public${problem.figure.src}. Upload it first.`,
          fieldErrors: { "figure.src": "File not found in the repository." },
        };
      }
    }

    // 4. Commit. Passing the SHA we loaded is what makes a concurrent edit
    //    fail loudly instead of overwriting someone.
    const renamed = Boolean(originalSlug) && originalSlug !== problem.slug;
    const verb = originalSlug ? (renamed ? "Rename" : "Update") : "Add";
    const result = await commitText({
      path: problemPath(problem.slug),
      text: serialise(problem),
      // On a rename the destination is a new file, so there is no SHA for it.
      sha: renamed ? undefined : sha,
      message: `${verb} problem: ${problem.title}${login ? ` (via admin, @${login})` : ""}`,
      token: githubToken,
    });

    // 5. A rename leaves the old file behind; remove it in a second commit.
    if (renamed && originalSlug) {
      const old = await readRepoFile(problemPath(originalSlug), githubToken);
      if (old) {
        await deleteRepoFile({
          path: old.path,
          sha: old.sha,
          message: `Remove old slug after rename: ${originalSlug}`,
          token: githubToken,
        });
      }
    }

    return {
      ok: true,
      slug: problem.slug,
      commitUrl: result.commitUrl,
      sha: result.sha,
    };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

export async function deleteProblem({
  slug,
  sha,
}: {
  slug: string;
  sha: string;
}): Promise<ActionResult> {
  const { githubToken, login } = await requireAdmin();
  try {
    const result = await deleteRepoFile({
      path: problemPath(slug),
      sha,
      message: `Delete problem: ${slug}${login ? ` (via admin, @${login})` : ""}`,
      token: githubToken,
    });
    return { ok: true, slug, commitUrl: result.commitUrl };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

export type UploadResult =
  | { ok: true; src: string; commitUrl: string }
  | { ok: false; message: string };

const ALLOWED_FIGURE = /\.(svg|png|jpe?g|webp)$/i;
const MAX_FIGURE_BYTES = 2 * 1024 * 1024;

/**
 * Commits a diagram into public/problems/.
 *
 * Because content lives in the repository, an image is just another file —
 * there is no blob store to configure. Dimensions are measured in the browser
 * before upload, so nothing here needs to decode the image.
 */
export async function uploadFigure({
  name,
  base64,
}: {
  name: string;
  base64: string;
}): Promise<UploadResult> {
  const { githubToken, login } = await requireAdmin();

  // Filename is attacker-controlled: strip any path and allow a known-safe set.
  const safeName = name
    .replace(/^.*[\\/]/, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-");

  if (!ALLOWED_FIGURE.test(safeName)) {
    return { ok: false, message: "Use an SVG, PNG, JPG or WebP file." };
  }
  if (!/^[a-z0-9]/.test(safeName)) {
    return { ok: false, message: "The filename must start with a letter or digit." };
  }
  // base64 inflates by ~4/3.
  if (base64.length * 0.75 > MAX_FIGURE_BYTES) {
    return { ok: false, message: "That file is larger than 2 MB." };
  }

  const path = `${REPO_PATHS.figures}/${safeName}`;
  try {
    const existing = await readRepoFile(path, githubToken);
    const result = await commitFile({
      path,
      base64,
      sha: existing?.sha,
      message: `${existing ? "Replace" : "Add"} diagram: ${safeName}${login ? ` (via admin, @${login})` : ""}`,
      token: githubToken,
    });
    // The path the content file references, relative to public/.
    return { ok: true, src: `/problems/${safeName}`, commitUrl: result.commitUrl };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}
