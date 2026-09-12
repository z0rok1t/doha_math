import type { Metadata } from "next";
import Link from "next/link";
import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { Container } from "@/components/layout/Container";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { TopicTag } from "@/components/ui/TopicTag";
import { requireAdmin } from "@/lib/admin/guard";
import {
  loadRepoProblems,
  type RepoProblem,
  type RepoProblemIssue,
} from "@/lib/admin/problems";
import { RepoError } from "@/lib/admin/repo";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Problems" };

export default async function AdminProblemsPage() {
  const { githubToken } = await requireAdmin();

  let problems: RepoProblem[] = [];
  let issues: RepoProblemIssue[] = [];
  let failure: string | null = null;

  try {
    const loaded = await loadRepoProblems(githubToken);
    problems = loaded.problems;
    issues = loaded.issues;
  } catch (error) {
    if (error instanceof RepoError) failure = error.message;
    else throw error;
  }

  const drafts = problems.filter(({ problem }) => problem.status === "draft");

  return (
    <Container className="py-12">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.8rem,3.5vw,2.4rem)]">Problems</h1>
          <p className="mt-2 font-mono text-[0.74rem] uppercase tracking-wide text-ink-soft">
            {problems.length} total · {drafts.length} draft
            {drafts.length === 1 ? "" : "s"}
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

      {issues.length ? (
        <div
          role="alert"
          className="mb-8 rounded-panel border-2 border-red bg-card p-5"
        >
          <h2 className="mb-2 font-semibold text-red-dark">
            {issues.length} file{issues.length === 1 ? "" : "s"} could not be
            read
          </h2>
          <p className="mb-3 text-[0.88rem] text-ink-soft">
            These are listed rather than hidden — a problem that silently
            vanished would be far more confusing. Fix them in the repository.
          </p>
          <ul className="space-y-1 font-mono text-[0.74rem]">
            {issues.map((issue) => (
              <li key={issue.path}>
                {issue.path}: {issue.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {problems.length ? (
        <div className="overflow-x-auto rounded-panel border-2 border-ink bg-card">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-ink">
                {["#", "Title", "Topic", "Difficulty", "Published", "Status"].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-4 py-3 font-mono text-[0.7rem] uppercase tracking-wide text-ink-soft"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {problems.map(({ problem }) => (
                <tr
                  key={problem.slug}
                  className="border-b border-line last:border-b-0 hover:bg-paper-alt"
                >
                  <td className="px-4 py-3 font-mono text-[0.8rem] text-ink-soft">
                    {problem.number}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/problems/${problem.slug}`}
                      className="font-semibold underline-offset-4 hover:text-red hover:underline"
                    >
                      {problem.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <TopicTag topic={problem.topic} />
                  </td>
                  <td className="px-4 py-3">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </td>
                  <td className="px-4 py-3 font-mono text-[0.74rem] text-ink-soft">
                    {formatDate(problem.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    {problem.status === "draft" ? (
                      <span className="rounded-mark bg-yellow px-2 py-0.5 font-mono text-[0.66rem] uppercase">
                        Draft
                      </span>
                    ) : (
                      <span className="font-mono text-[0.7rem] uppercase text-ink-soft">
                        Live
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : failure ? null : (
        <p className="rounded-panel border-2 border-dashed border-line bg-card px-6 py-14 text-center text-ink-soft">
          No problems in the repository yet.
        </p>
      )}
    </Container>
  );
}
