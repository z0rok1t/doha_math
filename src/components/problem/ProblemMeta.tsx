import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { TopicTag } from "@/components/ui/TopicTag";
import { formatCount, formatDate, formatDuration } from "@/lib/format";
import type { Problem } from "@/lib/types";

/** The metadata strip under a problem title. */
export function ProblemMeta({ problem }: { problem: Problem }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t-2 border-ink pt-4">
      <TopicTag topic={problem.topic} />
      <DifficultyBadge difficulty={problem.difficulty} />
      <span className="font-mono text-[0.68rem] uppercase text-ink-soft">
        {formatCount(problem.solveCount)} solves
      </span>
      <span className="font-mono text-[0.68rem] uppercase text-ink-soft">
        {formatDuration(problem.videoSeconds)} video
      </span>
      <span className="font-mono text-[0.68rem] uppercase text-ink-soft">
        {formatDate(problem.publishedAt)}
      </span>
    </div>
  );
}
