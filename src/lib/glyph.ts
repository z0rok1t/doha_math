import { topicLabel } from "@/lib/topics";
import type { Problem } from "@/lib/types";

const DISPLAY_MATH = /\$\$[\s\S]+?\$\$/g;
const INLINE_MATH = /\$([^$\n]{1,28})\$/g;
/** An expression worth lettering a thumbnail with has a relation or operator. */
const HAS_OPERATOR = /[=+\-<>^]|\frac|\dfrac|\tfrac|\int|\sqrt|\cdot|\times/;

/**
 * A short expression to letter a video thumbnail with, the way the mockup's
 * cards show "∫ x² dx" or "P(A|B)".
 *
 * Pulled from the problem's own statement so thumbnails look designed without
 * anyone authoring a separate field. Display math is skipped (too wide for a
 * 210px card) and so are bare quantities like "$10$", which look like a typo
 * blown up to 1.1rem. Falls back to the topic name.
 */
export function problemGlyph(problem: Problem): {
  text: string;
  isMath: boolean;
} {
  // An explicitly authored glyph always wins.
  if (problem.glyph) return { text: problem.glyph, isMath: true };

  const prose = problem.statement.replace(DISPLAY_MATH, " ");

  for (const match of prose.matchAll(INLINE_MATH)) {
    const tex = match[1].trim();
    if (tex.length >= 4 && HAS_OPERATOR.test(tex)) {
      return { text: `$${tex}$`, isMath: true };
    }
  }

  return { text: topicLabel(problem.topic), isMath: false };
}

/**
 * The problem to feature on the hero index card: the most-solved one that
 * actually yields an equation glyph, since the card is built around showing a
 * piece of maths. Falls back to the newest problem.
 */
export function pickHeroProblem(problems: Problem[]): Problem | null {
  if (!problems.length) return null;
  const bySolves = [...problems].sort(
    (a, b) => (b.solveCount ?? 0) - (a.solveCount ?? 0),
  );
  return bySolves.find((p) => problemGlyph(p).isMath) ?? problems[0];
}
