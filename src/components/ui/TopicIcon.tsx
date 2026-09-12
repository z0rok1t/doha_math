import { cn } from "@/lib/cn";
import type { Topic } from "@/lib/types";

/**
 * The eight topic glyphs from the approved mockup, redrawn to paint with
 * `currentColor` so each one picks up its topic's accent from the parent
 * (see `topicMeta().iconClass`) instead of hardcoding a hex value.
 */
const STROKE = {
  stroke: "currentColor",
  strokeWidth: 2.4,
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Glyph({ topic }: { topic: Topic }) {
  switch (topic) {
    case "algebra":
      // A rising-then-falling line: the shape of a graphed polynomial.
      return <path d="M4 24L14 6L20 18L26 4" {...STROKE} />;
    case "geometry":
      return (
        <polygon
          points="15,4 27,26 3,26"
          stroke="currentColor"
          strokeWidth={2.4}
          fill="none"
          strokeLinejoin="round"
        />
      );
    case "calculus":
      // A smooth curve — the thing you differentiate.
      return (
        <path
          d="M5 22C10 22 10 8 15 8C20 8 20 22 25 22"
          stroke="currentColor"
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
        />
      );
    case "probability":
      // Pips on a die face.
      return (
        <>
          <circle cx="10" cy="10" r="3" fill="currentColor" />
          <circle cx="20" cy="10" r="3" fill="currentColor" />
          <circle cx="10" cy="20" r="3" fill="currentColor" />
          <circle cx="20" cy="20" r="3" fill="currentColor" />
        </>
      );
    case "number-theory":
      // Lowercase p, as in "prime".
      return (
        <text
          x="4"
          y="22"
          fontSize="20"
          fill="currentColor"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          p
        </text>
      );
    case "puzzles":
      return (
        <text
          x="7"
          y="23"
          fontSize="22"
          fontWeight="700"
          fill="currentColor"
          style={{ fontFamily: "var(--font-display)" }}
        >
          ?
        </text>
      );
    case "statistics":
      // Three bars. The middle one keeps the mockup's second accent colour.
      return (
        <>
          <rect x="5" y="15" width="6" height="10" fill="currentColor" />
          <rect x="13" y="9" width="6" height="16" className="fill-blue" />
          <rect x="21" y="4" width="6" height="21" fill="currentColor" />
        </>
      );
    case "olympiad":
      return (
        <path
          d="M15 4L18 12L26 12L19.5 17L22 25L15 20L8 25L10.5 17L4 12L12 12Z"
          stroke="currentColor"
          strokeWidth={1.6}
          fill="none"
          strokeLinejoin="round"
        />
      );
  }
}

export function TopicIcon({
  topic,
  className,
}: {
  topic: Topic;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 30 30"
      aria-hidden="true"
      className={cn("h-[30px] w-[30px]", className)}
    >
      <Glyph topic={topic} />
    </svg>
  );
}
