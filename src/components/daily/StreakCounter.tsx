"use client";

import { useSyncExternalStore } from "react";
import { CheckStamp } from "@/components/ui/CheckStamp";
import { FlameIcon } from "@/components/ui/FlameIcon";
import {
  getServerStreakSnapshot,
  getStreakSnapshot,
  isSolvedToday,
  markSolved,
  subscribeToStreak,
} from "@/lib/streak";

/**
 * The viewer's own streak. Sits on the dark daily band, so it is styled
 * light-on-ink to match.
 *
 * Read through useSyncExternalStore: the server renders an empty streak, and
 * the stored value swaps in on hydration. Marking a day solved recomputes from
 * storage and notifies the store, so every mounted counter updates — including
 * one in another tab.
 */
export function StreakCounter() {
  const streak = useSyncExternalStore(
    subscribeToStreak,
    getStreakSnapshot,
    getServerStreakSnapshot,
  );

  const solvedToday = isSolvedToday(streak);

  return (
    <div className="font-mono wide:text-right">
      <b className="flex items-center gap-2 font-display text-[1.6rem] text-yellow wide:justify-end">
        <FlameIcon className="h-5 w-5" />
        {streak.current}
      </b>
      <span className="mt-1 block text-[0.78rem] text-ink-mute">
        DAY STREAK
      </span>

      {solvedToday ? (
        <p className="mt-3 flex items-center gap-2 text-[0.78rem] text-paper wide:justify-end">
          <CheckStamp />
          Counted for today
        </p>
      ) : (
        <button
          type="button"
          onClick={() => markSolved()}
          className="mt-3 rounded-ctl border-2 border-ink-line bg-ink-raise px-3.5 py-2 text-[0.74rem] uppercase text-paper transition-colors duration-150 hover:border-yellow hover:text-yellow"
        >
          I solved it today
        </button>
      )}

      {streak.longest > streak.current ? (
        <p className="mt-2 text-[0.7rem] text-ink-mute">BEST {streak.longest}</p>
      ) : null}
    </div>
  );
}
