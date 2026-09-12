import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProblemForm } from "@/components/admin/ProblemForm";
import { Container } from "@/components/layout/Container";
import { requireAdmin } from "@/lib/admin/guard";
import { loadRepoProblem } from "@/lib/admin/problems";

export async function generateMetadata(
  props: PageProps<"/admin/problems/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: `Edit ${slug}` };
}

export default async function EditProblemPage(
  props: PageProps<"/admin/problems/[slug]">,
) {
  const { githubToken } = await requireAdmin();
  const { slug } = await props.params;

  const loaded = await loadRepoProblem(slug, githubToken);
  if (!loaded) notFound();

  return (
    <Container className="py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/problems"
          className="font-mono text-[0.74rem] uppercase tracking-wide text-ink-soft hover:text-red"
        >
          &larr; Problems
        </Link>
        <Link
          href={`/problems/${loaded.problem.slug}`}
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-[0.74rem] uppercase tracking-wide text-ink-soft hover:text-red"
        >
          View on site &rarr;
        </Link>
      </div>

      <h1 className="mb-8 text-[clamp(1.6rem,3vw,2.2rem)]">
        {loaded.problem.title}
      </h1>

      <ProblemForm mode="edit" initial={loaded.problem} sha={loaded.sha} />
    </Container>
  );
}
