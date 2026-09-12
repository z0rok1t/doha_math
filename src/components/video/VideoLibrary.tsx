"use client";

import { useMemo, useState } from "react";
import { FilterPill } from "@/components/ui/FilterPill";
import { VideoCard } from "@/components/video/VideoCard";
import { TOPIC_LIST } from "@/lib/topics";
import type { Problem, Topic } from "@/lib/types";

/**
 * /watch — every video, filterable by topic, using the same card as the
 * homepage's Trending row. Client-side filtering, same reasoning as
 * ProblemBrowser: the library is small enough to ship whole.
 */
export function VideoLibrary({ problems }: { problems: Problem[] }) {
  const [topics, setTopics] = useState<Set<Topic>>(() => new Set());

  // Only offer topics that actually have a video.
  const available = useMemo(() => {
    const present = new Set(problems.map((problem) => problem.topic));
    return TOPIC_LIST.filter((topic) => present.has(topic.slug));
  }, [problems]);

  const visible = useMemo(
    () =>
      topics.size === 0
        ? problems
        : problems.filter((problem) => topics.has(problem.topic)),
    [problems, topics],
  );

  function toggleTopic(topic: Topic) {
    setTopics((current) => {
      const next = new Set(current);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-8 rounded-panel border-2 border-ink bg-card p-5">
        <fieldset>
          <legend className="mb-2 font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft">
            Topic
          </legend>
          <div className="flex flex-wrap gap-2">
            {available.map((topic) => (
              <FilterPill
                key={topic.slug}
                active={topics.has(topic.slug)}
                onClick={() => toggleTopic(topic.slug)}
              >
                {topic.label}
              </FilterPill>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <p aria-live="polite" className="font-mono text-[0.74rem] text-ink-soft">
            {visible.length === problems.length
              ? `${problems.length} videos`
              : `${visible.length} of ${problems.length} videos`}
          </p>
          {topics.size > 0 ? (
            <button
              type="button"
              onClick={() => setTopics(new Set())}
              className="border-b-2 border-ink pb-px font-mono text-[0.74rem] uppercase hover:text-red"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-panel border-2 border-dashed border-line bg-card px-6 py-14 text-center text-ink-soft">
          No videos in that topic yet.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((problem) => (
            <li key={problem.slug}>
              <VideoCard problem={problem} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
