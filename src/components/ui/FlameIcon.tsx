import { cn } from "@/lib/cn";

/** Streak motif — drawn in the same 2px-stroke idiom as the topic glyphs. */
export function FlameIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cn("h-4 w-4", className)}>
      <path
        d="M10 2.5c2.2 3 4.5 4.6 4.5 8a4.5 4.5 0 0 1-9 0c0-1.7.9-2.9 1.8-4 .2 1 .7 1.7 1.5 2 .1-2.4-.5-4.3 1.2-6z"
        stroke="currentColor"
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
