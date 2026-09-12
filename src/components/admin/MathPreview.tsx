"use client";

import { useDeferredValue } from "react";
import { MathText } from "@/components/problem/MathText";
import { cn } from "@/lib/cn";

/**
 * Live preview of a statement or solution step.
 *
 * It renders through the very same <MathText> the public pages use, rather
 * than a second implementation — so what you see here is exactly what ships,
 * and the two can never drift apart. (MathText is pure and imports only katex,
 * so it is safe to pull into a client bundle.)
 *
 * useDeferredValue keeps typing responsive: KaTeX re-renders the whole string
 * on every keystroke, and this lets React drop intermediate frames.
 */
export function MathPreview({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const deferred = useDeferredValue(text);

  if (!deferred.trim()) {
    return (
      <p className="font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft">
        Nothing to preview yet
      </p>
    );
  }

  return (
    <MathText
      as="div"
      text={deferred}
      className={cn("leading-relaxed", className)}
    />
  );
}
