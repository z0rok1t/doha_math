import Link from "next/link";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { TopicTag } from "@/components/ui/TopicTag";
import { cn } from "@/lib/cn";
import { formatCount, formatDuration } from "@/lib/format";
import type { Problem } from "@/lib/types";

/**
 * Problem card for the browse grid.
 *
 * The mockup had no problem-card design (only video and topic cards), so this
 * composes the same idiom: white stock, 2px ink border, mono metadata, and the
 * approved translate + hard-offset-shadow hover. Deliberately untilted — tilt
 * is reserved for single accent cards like the hero's, and a whole grid of
 * tilted cards reads as noise.
 */
export function ProblemCard({
  problem,
  className,
}: {
  problem: Problem;
  className?: string;
}) {
  return (
    <Link
      href={`/problems/${problem.slug}`}
      className={cn(
        "flex h-full flex-col rounded-panel border-2 border-ink bg-card p-5 transition-[transform,box-shadow] duration-[160ms] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-block-red",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[0.72rem] text-ink-soft">
          #{problem.number}
        </span>
        <TopicTag topic={problem.topic} />
      </div>

      <h3 className="mb-4 text-[1.05rem] leading-snug">{problem.title}</h3>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
        <DifficultyBadge difficulty={problem.difficulty} />
        <span className="font-mono text-[0.68rem] text-ink-soft">
          {formatCount(problem.solveCount)} solves ·{" "}
          {formatDuration(problem.videoSeconds)}
        </span>
      </div>
    </Link>
  );
}
