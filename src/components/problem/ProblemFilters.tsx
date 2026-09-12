"use client";

import { FilterPill } from "@/components/ui/FilterPill";
import { presetFor, SORT_PRESETS } from "@/lib/sort";
import { TOPIC_LIST } from "@/lib/topics";
import { DIFFICULTIES, type Difficulty, type SortKey, type SortState, type Topic } from "@/lib/types";

/**
 * Filter bar for /problems.
 *
 * Topic is multi-select per the brief. Difficulty is multi-select too — the
 * brief didn't say either way, and matching topic's behaviour keeps one
 * consistent idiom (a row of toggle pills) rather than mixing a pill row with
 * a dropdown.
 */

function Fieldset({
  legend,
  children,
}: {
  legend: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

export function ProblemFilters({
  topics,
  difficulties,
  sort,
  resultCount,
  totalCount,
  onToggleTopic,
  onToggleDifficulty,
  onSortChange,
  onClear,
}: {
  topics: Set<Topic>;
  difficulties: Set<Difficulty>;
  sort: SortState;
  resultCount: number;
  totalCount: number;
  onToggleTopic: (topic: Topic) => void;
  onToggleDifficulty: (difficulty: Difficulty) => void;
  onSortChange: (next: SortState) => void;
  onClear: () => void;
}) {
  const hasFilters = topics.size > 0 || difficulties.size > 0;

  return (
    <div className="mb-8 rounded-panel border-2 border-ink bg-card p-5">
      <div className="flex flex-wrap gap-x-10 gap-y-5">
        <Fieldset legend="Topic">
          {TOPIC_LIST.map((topic) => (
            <FilterPill
              key={topic.slug}
              active={topics.has(topic.slug)}
              onClick={() => onToggleTopic(topic.slug)}
            >
              {topic.label}
            </FilterPill>
          ))}
        </Fieldset>

        <Fieldset legend="Difficulty">
          {DIFFICULTIES.map((difficulty) => (
            <FilterPill
              key={difficulty}
              active={difficulties.has(difficulty)}
              onClick={() => onToggleDifficulty(difficulty)}
            >
              {difficulty}
            </FilterPill>
          ))}
        </Fieldset>

        <div className="min-w-0">
          <label
            htmlFor="problem-sort"
            className="mb-2 block font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft"
          >
            Sort
          </label>
          <select
            id="problem-sort"
            value={presetFor(sort)}
            onChange={(event) => {
              const preset = SORT_PRESETS.find(
                (option) => option.value === (event.target.value as SortKey),
              );
              if (preset) onSortChange(preset.state);
            }}
            className="rounded-ctl border-2 border-ink bg-card px-3 py-1.5 font-mono text-[0.74rem] uppercase"
          >
            {/* Present only when a table header has sorted off-preset. */}
            {presetFor(sort) === "" ? <option value="">Custom</option> : null}
            {SORT_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p aria-live="polite" className="font-mono text-[0.74rem] text-ink-soft">
          {resultCount === totalCount
            ? `${totalCount} problems`
            : `${resultCount} of ${totalCount} problems`}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="border-b-2 border-ink pb-px font-mono text-[0.74rem] uppercase hover:text-red"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
