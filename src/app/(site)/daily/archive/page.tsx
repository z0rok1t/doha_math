import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { TopicTag } from "@/components/ui/TopicTag";
import { getDailyArchive } from "@/lib/data/daily";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Daily archive",
  description: "Every past daily problem, newest first.",
};

export const revalidate = 3600;

export default async function DailyArchivePage() {
  const archive = await getDailyArchive();

  return (
    <Container className="py-14">
      <Link
        href="/daily"
        className="mb-8 inline-block font-mono text-[0.74rem] uppercase tracking-wide text-ink-soft hover:text-red"
      >
        &larr; Today&apos;s problem
      </Link>

      <header className="mb-10">
        <h1 className="text-[clamp(2rem,4vw,3rem)]">Daily archive</h1>
        <p className="mt-3 max-w-[520px] text-ink-soft">
          Every problem that has had a day of its own, newest first.
        </p>
      </header>

      {archive.length === 0 ? (
        <p className="rounded-panel border-2 border-dashed border-line bg-card px-6 py-14 text-center text-ink-soft">
          Nothing in the archive yet — today&apos;s problem is the first.
        </p>
      ) : (
        <ol className="overflow-hidden rounded-panel border-2 border-ink bg-card">
          {archive.map((entry) => (
            <li
              key={entry.date}
              className="border-b border-line last:border-b-0"
            >
              <Link
                href={`/problems/${entry.problem.slug}`}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 transition-colors duration-150 hover:bg-paper-alt"
              >
                <span className="w-[92px] shrink-0 font-mono text-[0.74rem] text-ink-soft">
                  DAY {entry.dayNumber}
                </span>
                <span className="w-[110px] shrink-0 font-mono text-[0.72rem] uppercase text-ink-soft">
                  {formatDate(entry.date)}
                </span>
                <span className="min-w-[200px] flex-1 font-semibold">
                  {entry.problem.title}
                </span>
                <TopicTag topic={entry.problem.topic} />
                <DifficultyBadge difficulty={entry.problem.difficulty} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Container>
  );
}
