"use client";

import { cn } from "@/lib/cn";
import type { ViewMode } from "@/lib/types";

const OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "cards", label: "Cards" },
  { value: "table", label: "Table" },
];

/** Segmented control for the card/table switch on /problems. */
export function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (next: ViewMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="View"
      className="inline-flex overflow-hidden rounded-ctl border-2 border-ink"
    >
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              "px-3.5 py-2 font-mono text-[0.78rem] uppercase transition-colors duration-150",
              active ? "bg-ink text-paper" : "bg-card text-ink hover:bg-paper-alt",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
