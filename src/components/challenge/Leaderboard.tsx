import { cn } from "@/lib/cn";
import type { Challenge } from "@/lib/types";

/**
 * Standings table.
 *
 * The rows it renders are PLACEHOLDER DATA read from the challenge content
 * files — there is no submission, timing or ranking system in v1.
 * TODO: when submissions exist, pass real standings in here instead; this
 * component only needs the rows, so nothing below changes.
 */
export function Leaderboard({
  rows,
  className,
}: {
  rows: Challenge["leaderboard"];
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "rounded-panel border-2 border-ink bg-card py-2",
        className,
      )}
    >
      {rows.map((row, index) => (
        <li
          key={row.handle}
          className="flex items-center gap-3.5 border-b border-line px-6 py-3.5 last:border-b-0"
        >
          <span
            className={cn(
              "w-[26px] font-display text-[1.1rem] font-bold",
              index === 0
                ? "text-yellow [-webkit-text-stroke:1px_var(--color-ink)]"
                : "text-ink-soft",
            )}
          >
            {row.rank}
          </span>
          <span
            aria-hidden="true"
            className="h-[34px] w-[34px] shrink-0 rounded-full bg-[linear-gradient(140deg,var(--color-blue),var(--color-red))]"
          />
          <span className="flex-1 text-[0.92rem] font-semibold">
            {row.handle}
          </span>
          <span className="font-mono text-[0.82rem] text-ink-soft">
            {row.score}
          </span>
        </li>
      ))}
    </ol>
  );
}
