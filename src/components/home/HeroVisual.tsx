import { MathText } from "@/components/problem/MathText";
import { CheckStamp } from "@/components/ui/CheckStamp";
import { IndexCard } from "@/components/ui/IndexCard";
import { TikTokEmbed } from "@/components/video/TikTokEmbed";
import { formatCount } from "@/lib/format";
import { problemGlyph } from "@/lib/glyph";
import type { Problem } from "@/lib/types";

/**
 * The hero's stacked visual: a tilted phone playing the daily video with an
 * index card overlapping its bottom-left corner.
 */
export function HeroVisual({
  featured,
  daily,
  handle,
}: {
  /** The problem lettered onto the index card. */
  featured: Problem;
  /** The problem playing on the phone. */
  daily: Problem;
  handle: string;
}) {
  const glyph = problemGlyph(featured);

  return (
    <div className="relative h-[400px] lg:h-[480px]">
      {/* Phone */}
      <div className="absolute right-2.5 top-0 h-[400px] w-[195px] rotate-3 rounded-[26px] bg-ink p-2.5 shadow-phone lg:h-[460px] lg:w-[230px]">
        <TikTokEmbed
          url={daily.tiktokUrl}
          label={daily.title}
          caption={`${handle} · #${daily.number}`}
          play="center"
          className="h-full w-full rounded-[18px]"
        />
      </div>

      {/* Index card, overlapping the phone */}
      <IndexCard
        tilt="left"
        shadow="yellow"
        className="absolute bottom-[18px] left-0 w-[205px] px-5 pb-5 pt-[22px] lg:w-[255px]"
      >
        <div className="mb-2.5 font-mono text-[0.72rem] text-ink-soft">
          PROBLEM #{featured.number}
        </div>
        {glyph.isMath ? (
          <MathText
            text={glyph.text}
            className="mb-3.5 block font-display text-[1.4rem]"
          />
        ) : (
          <div className="mb-3.5 font-display text-[1.4rem] leading-tight">
            {featured.title}
          </div>
        )}
        <div className="flex items-center gap-[7px] text-[0.82rem] font-semibold text-red-dark">
          <CheckStamp />
          Solved by {formatCount(featured.solveCount)} people
        </div>
      </IndexCard>
    </div>
  );
}
