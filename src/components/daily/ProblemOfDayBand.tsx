import Link from "next/link";
import { MathText } from "@/components/problem/MathText";
import type { DailyEntry } from "@/lib/types";

/**
 * The dark full-bleed daily band from the mockup.
 *
 * One deviation worth knowing: the mockup's big numeral was the *viewer's* day
 * streak. A streak lives in localStorage, so it can't be server-rendered into a
 * static page without a hydration flash. The numeral here is therefore the run
 * length of the daily series — a real, server-known day count — and the
 * viewer's own streak is a separate client-side element on /daily.
 */
export function ProblemOfDayBand({
  entry,
  rightSlot,
}: {
  entry: DailyEntry;
  /** Replaces the default "Try it" call to action (see /daily). */
  rightSlot?: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-[18px] rounded-panel bg-ink px-8 py-10 text-paper wide:grid-cols-[auto_1fr_auto] wide:gap-[34px] wide:px-11">
      <div className="font-display text-[4.2rem] leading-[0.85] text-yellow">
        {entry.dayNumber}
        <span className="mt-1.5 block font-mono text-[0.72rem] font-normal text-ink-mute">
          DAYS IN A ROW
        </span>
      </div>

      <div className="max-w-[480px]">
        <MathText
          text={entry.problem.statement}
          className="block font-display text-[1.5rem] leading-tight"
        />
      </div>

      {rightSlot ?? (
        <Link
          href={`/problems/${entry.problem.slug}`}
          className="group text-left font-mono wide:text-right"
        >
          <b className="block font-display text-[1.6rem] text-yellow">
            Try it{" "}
            <span className="inline-block transition-transform duration-150 group-hover:translate-x-1">
              &rarr;
            </span>
          </b>
          <span className="text-[0.78rem] text-ink-mute">
            SOLUTION UNLOCKS AFTER YOUR ATTEMPT
          </span>
        </Link>
      )}
    </div>
  );
}
