import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { MathProse } from "@/components/problem/MathText";
import { ProblemFigure } from "@/components/problem/ProblemFigure";
import { ProblemMeta } from "@/components/problem/ProblemMeta";
import { RelatedProblems } from "@/components/problem/RelatedProblems";
import { SolutionReveal } from "@/components/problem/SolutionReveal";
import { TikTokEmbed } from "@/components/video/TikTokEmbed";
import {
  getAllProblems,
  getProblemBySlug,
  getRelatedProblems,
} from "@/lib/data/problems";
import { problemGlyph } from "@/lib/glyph";

export async function generateStaticParams() {
  const problems = await getAllProblems();
  return problems.map((problem) => ({ slug: problem.slug }));
}

export async function generateMetadata(
  props: PageProps<"/problems/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const problem = await getProblemBySlug(slug);
  if (!problem) return { title: "Problem not found" };

  return {
    title: problem.title,
    // Strip math delimiters so the description reads as plain prose.
    description: problem.statement.replace(/\$+/g, "").slice(0, 155),
  };
}

export default async function ProblemPage(
  props: PageProps<"/problems/[slug]">,
) {
  const { slug } = await props.params;
  const problem = await getProblemBySlug(slug);
  if (!problem) notFound();

  const related = await getRelatedProblems(slug, 3);

  return (
    <Container className="py-14">
      {/* A reading page, so it runs narrower than the site's 1180px wrap:
          ~644px of content plus the 300px video rail. Header and body share
          these edges. */}
      <div className="mx-auto max-w-[1000px]">
        <Link
          href="/problems"
          className="mb-8 inline-block font-mono text-[0.74rem] uppercase tracking-wide text-ink-soft hover:text-red"
        >
          &larr; All problems
        </Link>

        <header className="mb-10">
          <div className="mb-2.5 font-mono text-[0.78rem] text-ink-soft">
            PROBLEM #{problem.number}
          </div>
          <h1 className="mb-5 max-w-[760px] text-[clamp(1.9rem,4vw,2.8rem)]">
            {problem.title}
          </h1>
          <ProblemMeta problem={problem} />
        </header>

        {/* The content column is capped rather than filling the grid: at 1180px
          an uncapped 1fr column produced ~92 characters a line, well past the
          60-75 that reads comfortably. Capping the column (instead of the text
          inside it) keeps the bordered cards hugging their own text. */}
        <div className="grid gap-10 wide:grid-cols-[minmax(0,1fr)_300px] wide:gap-14 wide:items-start">
          <div className="min-w-0 max-w-[640px]">
            {/* The statement, typeset with KaTeX. */}
            <div className="mb-6 rounded-panel border-2 border-ink bg-card p-6">
              <div className="mb-3 font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft">
                The problem
              </div>
              <MathProse
                text={problem.statement}
                className="text-[1.05rem] text-ink"
              />
              {problem.figure ? (
                <ProblemFigure figure={problem.figure} />
              ) : null}
            </div>

            <SolutionReveal slug={problem.slug} steps={problem.solutionSteps} />
          </div>

          {/* Video column. Vertical format, so it sits in a narrow rail rather
            than stretching across the content width. */}
          <aside className="mx-auto w-full max-w-[300px] wide:sticky wide:top-[104px] wide:max-w-none">
            <div className="rounded-[26px] border-2 border-ink bg-ink p-2.5">
              <TikTokEmbed
                url={problem.tiktokUrl}
                glyph={problemGlyph(problem)}
                label={problem.title}
                play="center"
                className="aspect-[9/16] w-full rounded-[18px]"
              />
            </div>
            {problem.tiktokUrl ? (
              <a
                href={problem.tiktokUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 block text-center font-mono text-[0.74rem] uppercase tracking-wide hover:text-red"
              >
                Watch on TikTok &rarr;
              </a>
            ) : (
              <p className="mt-3 text-center font-mono text-[0.7rem] uppercase tracking-wide text-ink-soft">
                Video linking soon
              </p>
            )}
          </aside>
        </div>

        <RelatedProblems problems={related} topic={problem.topic} />
      </div>
    </Container>
  );
}
