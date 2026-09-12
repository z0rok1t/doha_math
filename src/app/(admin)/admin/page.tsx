import type { Metadata } from "next";
import Link from "next/link";
import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { Container } from "@/components/layout/Container";
import { requireAdmin } from "@/lib/admin/guard";
import {
  listRepoDir,
  readRepoFile,
  REPO_PATHS,
  RepoError,
} from "@/lib/admin/repo";
import { problemSchema } from "@/lib/schemas";

export const metadata: Metadata = { title: "Overview" };

type Summary = {
  published: number;
  drafts: { slug: string; title: string }[];
  challenges: number;
};

async function loadSummary(token: string): Promise<Summary> {
  const entries = await listRepoDir(REPO_PATHS.problems, token);
  const jsonFiles = entries.filter((entry) => entry.name.endsWith(".json"));

  const parsed = await Promise.all(
    jsonFiles.map(async (entry) => {
      const file = await readRepoFile(entry.path, token);
      if (!file) return null;
      try {
        const result = problemSchema.safeParse(JSON.parse(file.text));
        return result.success ? result.data : null;
      } catch {
        // Malformed JSON in the repo — counted as neither, and the problems
        // list surfaces it properly.
        return null;
      }
    }),
  );

  const problems = parsed.flatMap((problem) => (problem ? [problem] : []));
  const challenges = await listRepoDir(REPO_PATHS.challenges, token);

  return {
    published: problems.filter((p) => p.status === "published").length,
    drafts: problems
      .filter((p) => p.status === "draft")
      .map(({ slug, title }) => ({ slug, title })),
    challenges: challenges.filter((entry) => entry.name.endsWith(".json"))
      .length,
  };
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-panel border-2 border-ink bg-card px-5 py-4">
      <b className="block font-display text-[1.8rem] leading-none">{value}</b>
      <span className="mt-1 block font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft">
        {label}
      </span>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const { githubToken, email } = await requireAdmin();

  let summary: Summary | null = null;
  let failure: string | null = null;
  try {
    summary = await loadSummary(githubToken);
  } catch (error) {
    if (error instanceof RepoError) failure = error.message;
    else throw error;
  }

  return (
    <Container className="py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.8rem,3.5vw,2.4rem)]">Overview</h1>
          <p className="mt-2 font-mono text-[0.74rem] uppercase tracking-wide text-ink-soft">
            Signed in as {email}
          </p>
        </div>
        <Link
          href="/admin/problems/new"
          className="inline-flex items-center rounded-ctl border-2 border-red-dark bg-red px-5 py-[11px] font-semibold text-paper transition-transform duration-150 hover:-translate-y-0.5"
        >
          New problem
        </Link>
      </header>

      {failure ? <AdminSetupNotice message={failure} /> : null}

      {summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat value={summary.published} label="Published problems" />
            <Stat value={summary.drafts.length} label="Drafts" />
            <Stat value={summary.challenges} label="Challenges" />
          </div>

          <section className="mt-10">
            <h2 className="mb-4 text-[1.3rem]">
              {summary.drafts.length ? "Unfinished drafts" : "No drafts"}
            </h2>
            {summary.drafts.length ? (
              <ul className="overflow-hidden rounded-panel border-2 border-ink bg-card">
                {summary.drafts.map((draft) => (
                  <li
                    key={draft.slug}
                    className="border-b border-line last:border-b-0"
                  >
                    <Link
                      href={`/admin/problems/${draft.slug}`}
                      className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-paper-alt"
                    >
                      <span className="font-semibold">{draft.title}</span>
                      <span className="rounded-mark bg-yellow px-2 py-0.5 font-mono text-[0.66rem] uppercase">
                        Draft
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-soft">
                Everything written is published.{" "}
                <Link href="/admin/problems/new" className="underline">
                  Start a new problem
                </Link>
                .
              </p>
            )}
          </section>
        </>
      ) : null}
    </Container>
  );
}
