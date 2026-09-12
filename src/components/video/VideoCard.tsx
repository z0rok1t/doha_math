import Link from "next/link";
import { TikTokEmbed } from "@/components/video/TikTokEmbed";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";
import { problemGlyph } from "@/lib/glyph";
import { topicLabel } from "@/lib/topics";
import type { Problem } from "@/lib/types";

/**
 * The mockup's video card, reused by the homepage Trending row and /watch.
 *
 * Hover is the approved move: a lift plus a hard offset red block — a CSS
 * transition, not a Framer Motion animation, since it's a pure hover state.
 */
export function VideoCard({
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
        "group block overflow-hidden rounded-panel border-2 border-ink bg-card transition-[transform,box-shadow] duration-[180ms] hover:-translate-y-[5px] hover:shadow-block-red",
        className,
      )}
    >
      <div className="relative">
        {/* A fixed 4:5 portrait ratio. A fixed pixel height instead let the
            ratio drift with column width — square at 1440px and actually
            landscape at 768px, which reads wrong for vertical video. */}
        <TikTokEmbed
          url={problem.tiktokUrl}
          glyph={problemGlyph(problem)}
          label={problem.title}
          className="aspect-[4/5] w-full"
        />
        {/* Runtime chip — the mockup's cards didn't carry one, but the table
            view and /watch both surface length, so it belongs here too. */}
        <span className="absolute right-3 top-3 rounded-mark bg-ink/75 px-1.5 py-0.5 font-mono text-[0.68rem] text-paper">
          {formatDuration(problem.videoSeconds)}
        </span>
      </div>
      <div className="px-3.5 pb-4 pt-3.5">
        <div className="mb-1.5 font-mono text-[0.68rem] uppercase tracking-wide text-red-dark">
          {topicLabel(problem.topic)}
        </div>
        <div className="text-[0.92rem] font-semibold leading-[1.3]">
          {problem.title}
        </div>
      </div>
    </Link>
  );
}
