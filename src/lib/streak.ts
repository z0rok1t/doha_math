import { todayIso } from "@/lib/format";
import { readStorage, writeStorage } from "@/lib/storage";

/**
 * A deliberately small streak: how many days in a row you have marked a daily
 * problem solved. Kept in localStorage, per browser, no account.
 *
 * This is intentionally not a gamification system — no points, levels, badges
 * or loss-aversion nudges. It exists so the daily habit is visible.
 *
 * Exposed as an external store (subscribe / getSnapshot) so components can read
 * it through `useSyncExternalStore`. That is the supported way to read
 * client-only state: it gives React a server snapshot to render, then swaps in
 * the real value on hydration, with no setState-from-an-effect and no cascading
 * render on every page load.
 *
 * TODO: with accounts, move this server-side so a streak survives a cleared
 * cache and follows a solver across devices. The shape below is already what a
 * row in that table would hold.
 */
export type Streak = {
  current: number;
  longest: number;
  /** ISO date of the most recent day marked solved. */
  lastSolvedDate: string | null;
};

const STORAGE_KEY = "mira:streak";

/** Fired after a write so same-tab listeners update ("storage" is cross-tab). */
const STREAK_CHANGED = "mira:streak-changed";

export const EMPTY_STREAK: Streak = {
  current: 0,
  longest: 0,
  lastSolvedDate: null,
};

function previousDay(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function parseStreak(raw: string | null): Streak {
  if (!raw) return EMPTY_STREAK;
  try {
    const parsed = JSON.parse(raw) as Partial<Streak>;
    return {
      current: typeof parsed.current === "number" ? parsed.current : 0,
      longest: typeof parsed.longest === "number" ? parsed.longest : 0,
      lastSolvedDate:
        typeof parsed.lastSolvedDate === "string"
          ? parsed.lastSolvedDate
          : null,
    };
  } catch {
    // Corrupt or hand-edited value — start clean rather than throwing.
    return EMPTY_STREAK;
  }
}

/**
 * Cached so getSnapshot returns a referentially stable object while the stored
 * string is unchanged; returning a fresh object each call would make
 * useSyncExternalStore re-render forever.
 */
let snapshot: { raw: string | null; value: Streak } = {
  raw: null,
  value: EMPTY_STREAK,
};

export function subscribeToStreak(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(STREAK_CHANGED, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STREAK_CHANGED, onChange);
  };
}

export function getStreakSnapshot(): Streak {
  const raw = readStorage(STORAGE_KEY);
  if (raw !== snapshot.raw) snapshot = { raw, value: parseStreak(raw) };
  return snapshot.value;
}

/** What the server renders, and what hydration starts from. */
export function getServerStreakSnapshot(): Streak {
  return EMPTY_STREAK;
}

export function readStreak(): Streak {
  return parseStreak(readStorage(STORAGE_KEY));
}

/** True when today has already been counted. */
export function isSolvedToday(
  streak: Streak,
  today: string = todayIso(),
): boolean {
  return streak.lastSolvedDate === today;
}

/**
 * Counts today. Consecutive with yesterday extends the streak; a gap starts a
 * new one; marking twice in a day does nothing.
 *
 * Always computed from what is actually in storage, not from a rendered value,
 * so a stale render can never restart a valid streak.
 */
export function markSolved(today: string = todayIso()): Streak {
  const streak = readStreak();
  if (streak.lastSolvedDate === today) return streak;

  const current =
    streak.lastSolvedDate === previousDay(today) ? streak.current + 1 : 1;

  const next: Streak = {
    current,
    longest: Math.max(streak.longest, current),
    lastSolvedDate: today,
  };

  writeStorage(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(STREAK_CHANGED));
  return next;
}
