import type { Metadata } from "next";
import Link from "next/link";
import { ProblemForm } from "@/components/admin/ProblemForm";
import { Container } from "@/components/layout/Container";
import { requireAdmin } from "@/lib/admin/guard";
import { loadRepoProblems, nextProblemNumber } from "@/lib/admin/problems";
import { todayIso } from "@/lib/format";

export const metadata: Metadata = { title: "New problem" };

export default async function NewProblemPage() {
  const { githubToken } = await requireAdmin();
  const { problems } = await loadRepoProblems(githubToken);

  return (
    <Container className="py-12">
      <Link
        href="/admin/problems"
        className="mb-6 inline-block font-mono text-[0.74rem] uppercase tracking-wide text-ink-soft hover:text-red"
      >
        &larr; Problems
      </Link>
      <h1 className="mb-8 text-[clamp(1.8rem,3.5vw,2.4rem)]">New problem</h1>

      <ProblemForm
        mode="create"
        initial={{
          // Starts as a draft: a half-written problem should not be live the
          // moment it is first saved.
          status: "draft",
          slug: "",
          number: nextProblemNumber(problems),
          title: "",
          topic: "algebra",
          difficulty: "medium",
          statement: "",
          solutionSteps: [""],
          publishedAt: todayIso(),
        }}
      />
    </Container>
  );
}
