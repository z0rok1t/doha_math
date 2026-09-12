"use client";

import Link from "next/link";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { cn } from "@/lib/cn";
import { formatCount, formatDuration } from "@/lib/format";
import { defaultDirection } from "@/lib/sort";
import { topicLabel } from "@/lib/topics";
import type { Problem, SortColumn, SortState } from "@/lib/types";

/**
 * Table view.
 *
 * The brief refers to a "sortable table pattern from the design reference",
 * but the mockup contains no table — its only tabular element is the
 * leaderboard. So this borrows that idiom: hairline `--line` row dividers,
 * mono for every numeric cell, and a hard 2px ink frame.
 *
 * Every column header is a sort button; the arrow shows the active column and
 * direction. Sort state is owned by ProblemBrowser and shared with the filter
 * bar's preset dropdown.
 */

const COLUMNS: {
  column: SortColumn;
  label: string;
  className: string;
  numeric?: boolean;
}[] = [
  { column: "number", label: "#", className: "w-[72px]" },
  { column: "title", label: "Problem", className: "min-w-[240px]" },
  { column: "topic", label: "Topic", className: "w-[150px]" },
  { column: "difficulty", label: "Difficulty", className: "w-[130px]" },
  { column: "solveCount", label: "Solves", className: "w-[110px]", numeric: true },
  { column: "videoSeconds", label: "Length", className: "w-[100px]", numeric: true },
];

function SortArrow({ direction }: { direction: "asc" | "desc" }) {
  return (
    <span aria-hidden="true" className="ml-1 inline-block text-red">
      {direction === "asc" ? "↑" : "↓"}
    </span>
  );
}

export function ProblemTable({
  problems,
  sort,
  onSortChange,
}: {
  problems: Problem[];
  sort: SortState;
  onSortChange: (next: SortState) => void;
}) {
  function handleSort(column: SortColumn) {
    onSortChange(
      sort.column === column
        ? { column, direction: sort.direction === "asc" ? "desc" : "asc" }
        : { column, direction: defaultDirection(column) },
    );
  }

  return (
    // Wide content scrolls inside its own box; the page body never scrolls
    // sideways.
    <div className="overflow-x-auto rounded-panel border-2 border-ink bg-card">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Problems, sortable by column. {problems.length} shown.
        </caption>
        <thead>
          <tr className="border-b-2 border-ink">
            {COLUMNS.map((col) => {
              const active = sort.column === col.column;
              return (
                <th
                  key={col.column}
                  scope="col"
                  aria-sort={
                    active
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={cn("p-0", col.className)}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(col.column)}
                    className={cn(
                      "flex w-full items-center px-4 py-3 font-mono text-[0.72rem] uppercase tracking-wide transition-colors duration-150 hover:bg-paper-alt",
                      col.numeric && "justify-end",
                      active ? "text-ink" : "text-ink-soft",
                    )}
                  >
                    {col.label}
                    {active ? <SortArrow direction={sort.direction} /> : null}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => (
            <tr
              key={problem.slug}
              className="border-b border-line last:border-b-0 hover:bg-paper-alt"
            >
              <td className="px-4 py-3 font-mono text-[0.8rem] text-ink-soft">
                {problem.number}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/problems/${problem.slug}`}
                  className="font-semibold underline-offset-4 hover:text-red hover:underline"
                >
                  {problem.title}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-[0.72rem] uppercase text-red-dark">
                {topicLabel(problem.topic)}
              </td>
              <td className="px-4 py-3">
                <DifficultyBadge difficulty={problem.difficulty} />
              </td>
              <td className="px-4 py-3 text-right font-mono text-[0.8rem] text-ink-soft">
                {formatCount(problem.solveCount)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-[0.8rem] text-ink-soft">
                {formatDuration(problem.videoSeconds)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
