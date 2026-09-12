import { cn } from "@/lib/cn";
import type { Problem } from "@/lib/types";

/**
 * A problem's diagram.
 *
 * Deliberately a plain <img> rather than next/image:
 *
 * - These are line diagrams the author draws once and drops in `public/`, not
 *   photographs. Next's optimizer mainly buys resizing and format conversion,
 *   which does nothing useful for an SVG and little for a small PNG.
 * - SVG is the natural format for a maths figure, and serving SVG through
 *   next/image requires `images.dangerouslyAllowSVG`. That is a real security
 *   flag (an SVG can carry script), and turning it on site-wide to render a
 *   handful of first-party diagrams is a bad trade.
 *
 * `width`/`height` come from the content file and are always set, so the space
 * is reserved before the file loads and the page never jumps.
 */
export function ProblemFigure({
  figure,
  className,
}: {
  figure: NonNullable<Problem["figure"]>;
  className?: string;
}) {
  return (
    <figure className={cn("mt-5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- see note above */}
      <img
        src={figure.src}
        alt={figure.alt}
        width={figure.width}
        height={figure.height}
        loading="lazy"
        decoding="async"
        className="mx-auto h-auto w-full max-w-[420px] rounded-card border-2 border-ink bg-card"
      />
      {figure.caption ? (
        <figcaption className="mt-2.5 text-center font-mono text-[0.7rem] uppercase tracking-wide text-ink-soft">
          {figure.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
