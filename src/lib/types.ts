export type {
  Problem,
  Challenge,
  DailySchedule,
  SiteContent,
  Topic,
  Difficulty,
} from "@/lib/schemas";

export { TOPICS, DIFFICULTIES } from "@/lib/schemas";

/** A daily-schedule entry resolved to the problem it points at. */
export type DailyEntry = {
  date: string;
  /** 1-based day number in the run of daily problems, oldest = 1. */
  dayNumber: number;
  problem: import("@/lib/schemas").Problem;
};

/** Named sort presets offered in the filter bar. */
export type SortKey = "newest" | "most-solved" | "difficulty";

/** Any column the table view can sort by. */
export type SortColumn =
  | "number"
  | "title"
  | "topic"
  | "difficulty"
  | "solveCount"
  | "videoSeconds"
  | "publishedAt";

export type SortState = { column: SortColumn; direction: "asc" | "desc" };

/** The two presentations of the problem list. */
export type ViewMode = "cards" | "table";
