import { difficultyRank } from "@/lib/format";
import type { Problem, SortColumn, SortKey, SortState } from "@/lib/types";

/** The three presets the filter bar offers. */
export const SORT_PRESETS: {
  value: SortKey;
  label: string;
  state: SortState;
}[] = [
  { value: "newest", label: "Newest", state: { column: "publishedAt", direction: "desc" } },
  { value: "most-solved", label: "Most solved", state: { column: "solveCount", direction: "desc" } },
  { value: "difficulty", label: "Difficulty", state: { column: "difficulty", direction: "asc" } },
];

/** The preset matching a sort state, if any — the table can sort off-preset. */
export function presetFor(state: SortState): SortKey | "" {
  return (
    SORT_PRESETS.find(
      (preset) =>
        preset.state.column === state.column &&
        preset.state.direction === state.direction,
    )?.value ?? ""
  );
}

/** Numbers sort high-to-low by default; text sorts A-to-Z. */
export function defaultDirection(column: SortColumn): "asc" | "desc" {
  return column === "title" || column === "topic" || column === "difficulty"
    ? "asc"
    : "desc";
}

function valueFor(problem: Problem, column: SortColumn): string | number {
  switch (column) {
    case "number":
      return problem.number;
    case "title":
      return problem.title.toLowerCase();
    case "topic":
      return problem.topic;
    case "difficulty":
      return difficultyRank(problem.difficulty);
    case "solveCount":
      return problem.solveCount ?? -1;
    case "videoSeconds":
      return problem.videoSeconds ?? -1;
    case "publishedAt":
      return problem.publishedAt;
  }
}

export function sortProblems(
  problems: Problem[],
  state: SortState,
): Problem[] {
  const factor = state.direction === "asc" ? 1 : -1;
  return [...problems].sort((a, b) => {
    const left = valueFor(a, state.column);
    const right = valueFor(b, state.column);
    if (left === right) {
      // Stable, predictable tiebreak so equal rows don't shuffle between renders.
      return a.number - b.number;
    }
    const comparison =
      typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right));
    return comparison * factor;
  });
}
