import { cn } from "@/lib/cn";
import type { Difficulty } from "@/lib/types";

/**
 * The mockup never specified a difficulty treatment, so this follows its
 * small-mono-label idiom: a palette dot plus the word itself. The word carries
 * the meaning, so the colour is decoration rather than the only signal.
 */
const DOT: Record<Difficulty, string> = {
  easy: "bg-blue",
  medium: "bg-yellow",
  hard: "bg-red",
};

export function DifficultyBadge({
  difficulty,
  className,
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-wide text-ink-soft",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-2 w-2 shrink-0 rounded-full border border-ink",
          DOT[difficulty],
        )}
      />
      {difficulty}
    </span>
  );
}
