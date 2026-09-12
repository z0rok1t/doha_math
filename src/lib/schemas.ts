import { z } from "zod";

/**
 * Content schemas. Every file under /content is parsed through one of these at
 * load time, so a malformed or half-finished content file fails the build with
 * a field-level message instead of rendering a broken page.
 */

export const TOPICS = [
  "algebra",
  "geometry",
  "calculus",
  "probability",
  "number-theory",
  "puzzles",
  "statistics",
  "olympiad",
] as const;

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

const slug = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug");

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be an ISO date (YYYY-MM-DD)");

export const problemSchema = z.object({
  slug,
  number: z.number().int().positive(),
  title: z.string().min(1),
  topic: z.enum(TOPICS),
  difficulty: z.enum(DIFFICULTIES),
  /**
   * Drafts are invisible to the public site. Defaulted rather than required so
   * content written before this existed stays valid without editing.
   */
  status: z.enum(["draft", "published"]).default("published"),
  /** Supports inline math: $x^2$ and display math: $$...$$ */
  statement: z.string().min(1),
  /** One revealable step per entry; order is the reveal order. */
  solutionSteps: z.array(z.string().min(1)).min(1),
  /**
   * Short expression to letter the video thumbnail with, e.g. "$P(A\mid B)$".
   * Optional: when absent it is derived from the statement (see lib/glyph.ts).
   * Set it when the derived one is weak or you want a specific look.
   */
  glyph: z.string().min(1).optional(),
  /**
   * An optional diagram, for problems that are really about a figure.
   * The file lives in `public/problems/`, and the build checks it exists.
   *
   * `alt` is required, not optional: a geometry diagram with no text
   * alternative is invisible to anyone using a screen reader, and it is the
   * one thing an author cannot add later without re-reading the problem.
   * `width`/`height` are the image's real pixel dimensions — they reserve the
   * right space before the file loads, so the page doesn't jump.
   */
  figure: z
    .object({
      src: z
        .string()
        .regex(
          /^\/problems\/[a-z0-9][a-z0-9._-]*\.(svg|png|jpg|jpeg|webp)$/i,
          "must be a path like /problems/my-diagram.svg (file goes in public/problems/)",
        ),
      alt: z.string().min(1, "a diagram needs a text alternative"),
      caption: z.string().min(1).optional(),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .optional(),
  tiktokUrl: z.url().optional(),
  /** Runtime of the TikTok video, used by the table view and video cards. */
  videoSeconds: z.number().int().positive().optional(),
  solveCount: z.number().int().nonnegative().optional(),
  publishedAt: isoDate,
});

export const challengeSchema = z.object({
  slug,
  /** Human label for the week, e.g. "Week 24". */
  week: z.string().min(1),
  title: z.string().min(1),
  prompt: z.string().min(1),
  opensAt: isoDate,
  closesAt: isoDate,
  solutionSteps: z.array(z.string().min(1)).optional(),
  /** Placeholder standings — see content/challenges/*.json. */
  leaderboard: z.array(
    z.object({
      rank: z.number().int().positive(),
      handle: z.string().min(1),
      score: z.string().min(1),
    }),
  ),
});

/** Maps an ISO date to the slug of the problem that ran that day. */
export const dailyScheduleSchema = z.record(isoDate, slug);

const statSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

export const siteContentSchema = z.object({
  name: z.string().min(1),
  handle: z.string().min(1),
  tagline: z.string().min(1),
  hero: z.object({
    eyebrow: z.string().min(1),
    /** Rendered as separate lines; the last line is accented in red italic. */
    headlineLines: z.array(z.string().min(1)).min(1),
    headlineAccent: z.string().min(1),
    headlineAccentSuffix: z.string(),
    sub: z.string().min(1),
  }),
  heroStats: z.array(statSchema).min(1),
  about: z.object({
    heading: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
    shortParagraph: z.string().min(1),
    stats: z.array(statSchema).min(1),
  }),
  newsletter: z.object({
    heading: z.string().min(1),
    note: z.string().min(1),
  }),
  socials: z.array(
    z.object({
      platform: z.string().min(1),
      handle: z.string().min(1),
      url: z.url(),
    }),
  ),
  press: z.array(
    z.object({
      outlet: z.string().min(1),
      title: z.string().min(1),
      url: z.url(),
      date: isoDate,
    }),
  ),
});

export type Problem = z.infer<typeof problemSchema>;
export type Challenge = z.infer<typeof challengeSchema>;
export type DailySchedule = z.infer<typeof dailyScheduleSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
export type Topic = (typeof TOPICS)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
