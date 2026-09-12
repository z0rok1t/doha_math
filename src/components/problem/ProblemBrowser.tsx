"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import { ProblemCard } from "@/components/problem/ProblemCard";
import { ProblemFilters } from "@/components/problem/ProblemFilters";
import { ProblemTable } from "@/components/problem/ProblemTable";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { SORT_PRESETS, sortProblems } from "@/lib/sort";
import type {
  Difficulty,
  Problem,
  SortState,
  Topic,
  ViewMode,
} from "@/lib/types";

/**
 * Owns filter, sort and view state for /problems. Filtering is client-side,
 * which is the right trade at this dataset size — the full library ships with
 * the page and every interaction is instant.
 *
 * `initialTopic` comes from the `?topic=` query param so the homepage's topic
 * cards land here pre-filtered. The URL is read once on mount and not written
 * back as filters change; keeping history clean matters more in v1 than making
 * every filter combination linkable.
 *
 * TODO: if the library outgrows client-side filtering (low thousands), move
 * filtering to the server via searchParams and paginate — the data accessors
 * are already async, so only this component changes.
 */
export function ProblemBrowser({
  problems,
  initialTopic,
}: {
  problems: Problem[];
  initialTopic?: Topic;
}) {
  const [topics, setTopics] = useState<Set<Topic>>(
    () => new Set(initialTopic ? [initialTopic] : []),
  );
  const [difficulties, setDifficulties] = useState<Set<Difficulty>>(
    () => new Set(),
  );
  const [sort, setSort] = useState<SortState>(SORT_PRESETS[0].state);
  const [view, setView] = useState<ViewMode>("cards");
  const reduceMotion = useReducedMotion();

  const visible = useMemo(() => {
    const filtered = problems.filter(
      (problem) =>
        (topics.size === 0 || topics.has(problem.topic)) &&
        (difficulties.size === 0 || difficulties.has(problem.difficulty)),
    );
    return sortProblems(filtered, sort);
  }, [problems, topics, difficulties, sort]);

  function toggle<T>(set: Set<T>, value: T): Set<T> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <ViewToggle value={view} onChange={setView} />
      </div>

      <ProblemFilters
        topics={topics}
        difficulties={difficulties}
        sort={sort}
        resultCount={visible.length}
        totalCount={problems.length}
        onToggleTopic={(topic) => setTopics((current) => toggle(current, topic))}
        onToggleDifficulty={(difficulty) =>
          setDifficulties((current) => toggle(current, difficulty))
        }
        onSortChange={setSort}
        onClear={() => {
          setTopics(new Set());
          setDifficulties(new Set());
        }}
      />

      {visible.length === 0 ? (
        <p className="rounded-panel border-2 border-dashed border-line bg-card px-6 py-14 text-center text-ink-soft">
          Nothing matches those filters yet. Try widening the topic or
          difficulty.
        </p>
      ) : (
        /* Card/table crossfade: one view leaves before the next arrives, so
           the two layouts never overlap mid-transition. */
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={view}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {view === "cards" ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((problem) => (
                  <li key={problem.slug}>
                    <ProblemCard problem={problem} />
                  </li>
                ))}
              </ul>
            ) : (
              <ProblemTable
                problems={visible}
                sort={sort}
                onSortChange={setSort}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
