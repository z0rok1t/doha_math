import type { Topic } from "@/lib/types";
import { TOPICS } from "@/lib/types";

/**
 * Per-topic presentation metadata. Class names are written out in full rather
 * than composed at runtime (`shadow-block-${accent}`) because Tailwind's
 * scanner only sees literal strings.
 */
export type TopicMeta = {
  slug: Topic;
  label: string;
  /** Alternates red/blue across the grid, matching the approved mockup. */
  accent: "red" | "blue";
  iconClass: string;
  hoverShadowClass: string;
};

const META: Record<Topic, TopicMeta> = {
  algebra: {
    slug: "algebra",
    label: "Algebra",
    accent: "red",
    iconClass: "text-red",
    hoverShadowClass: "hover:shadow-block-red",
  },
  geometry: {
    slug: "geometry",
    label: "Geometry",
    accent: "blue",
    iconClass: "text-blue",
    hoverShadowClass: "hover:shadow-block-blue",
  },
  calculus: {
    slug: "calculus",
    label: "Calculus",
    accent: "red",
    iconClass: "text-red",
    hoverShadowClass: "hover:shadow-block-red",
  },
  probability: {
    slug: "probability",
    label: "Probability",
    accent: "blue",
    iconClass: "text-blue",
    hoverShadowClass: "hover:shadow-block-blue",
  },
  "number-theory": {
    slug: "number-theory",
    label: "Number Theory",
    accent: "red",
    iconClass: "text-red",
    hoverShadowClass: "hover:shadow-block-red",
  },
  puzzles: {
    slug: "puzzles",
    label: "Logic Puzzles",
    accent: "blue",
    iconClass: "text-blue",
    hoverShadowClass: "hover:shadow-block-blue",
  },
  statistics: {
    slug: "statistics",
    label: "Statistics",
    accent: "red",
    iconClass: "text-red",
    hoverShadowClass: "hover:shadow-block-red",
  },
  olympiad: {
    slug: "olympiad",
    label: "Olympiad",
    accent: "blue",
    iconClass: "text-blue",
    hoverShadowClass: "hover:shadow-block-blue",
  },
};

/** Topics in the display order used by the mockup's topic grid. */
export const TOPIC_LIST: TopicMeta[] = TOPICS.map((t) => META[t]);

export function topicMeta(topic: Topic): TopicMeta {
  return META[topic];
}

export function topicLabel(topic: Topic): string {
  return META[topic].label;
}

/** Narrows an arbitrary string (e.g. a `?topic=` value) to a real Topic. */
export function isTopic(value: string): value is Topic {
  return (TOPICS as readonly string[]).includes(value);
}
