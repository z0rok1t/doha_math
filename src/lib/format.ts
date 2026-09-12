import type { Difficulty } from "@/lib/types";

/** 84 -> "1:24". Used by the table view and video cards. */
export function formatDuration(seconds: number | undefined): string {
  if (seconds === undefined) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** 3110 -> "3,110" */
export function formatCount(count: number | undefined): string {
  if (count === undefined) return "—";
  return count.toLocaleString("en-US");
}

/** "2026-09-11" -> "Sep 11, 2026", with no timezone drift. */
export function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const DIFFICULTY_ORDER: Record<Difficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

export function difficultyRank(difficulty: Difficulty): number {
  return DIFFICULTY_ORDER[difficulty];
}

/** Today as YYYY-MM-DD in the viewer's local timezone. */
export function todayIso(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
