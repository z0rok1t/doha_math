import { loadDailySchedule, loadProblems } from "@/lib/data/source";
import { todayIso } from "@/lib/format";
import type { DailyEntry } from "@/lib/types";

/**
 * Resolves content/daily.json (ISO date -> problem slug) into dated entries,
 * oldest first, with a 1-based day number. Entries pointing at a slug that no
 * longer exists are dropped rather than crashing the page.
 */
async function resolveSchedule(): Promise<DailyEntry[]> {
  const [schedule, problems] = await Promise.all([
    loadDailySchedule(),
    loadProblems(),
  ]);
  const bySlug = new Map(problems.map((problem) => [problem.slug, problem]));

  return Object.entries(schedule)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([date, slug], index) => {
      const problem = bySlug.get(slug);
      if (!problem) return [];
      return [{ date, dayNumber: index + 1, problem }];
    });
}

export async function getDailyForDate(date: string): Promise<DailyEntry | null> {
  const entries = await resolveSchedule();
  return entries.find((entry) => entry.date === date) ?? null;
}

/**
 * Today's entry. If today isn't scheduled, falls back to the most recent past
 * entry so /daily is never empty — and if the schedule is entirely in the
 * future, to the earliest one.
 */
export async function getTodayDaily(): Promise<DailyEntry | null> {
  const entries = await resolveSchedule();
  if (!entries.length) return null;

  const today = todayIso();
  const exact = entries.find((entry) => entry.date === today);
  if (exact) return exact;

  const past = entries.filter((entry) => entry.date <= today);
  return past.length ? past[past.length - 1] : entries[0];
}

/** Past daily problems, newest first, excluding today's. */
export async function getDailyArchive(): Promise<DailyEntry[]> {
  const entries = await resolveSchedule();
  const current = await getTodayDaily();
  return entries
    .filter((entry) => entry.date !== current?.date)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Length of the whole daily run, used as the "day count" numeral. */
export async function getDailyRunLength(): Promise<number> {
  return (await resolveSchedule()).length;
}
