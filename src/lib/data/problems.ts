import { loadProblems } from "@/lib/data/source";
import type { Problem, Topic } from "@/lib/types";
import { TOPICS } from "@/lib/types";

/** All problems, newest first. */
export async function getAllProblems(): Promise<Problem[]> {
  return loadProblems();
}

export async function getProblemBySlug(slug: string): Promise<Problem | null> {
  const problems = await loadProblems();
  return problems.find((problem) => problem.slug === slug) ?? null;
}

export async function getProblemsByTopic(topic: Topic): Promise<Problem[]> {
  const problems = await loadProblems();
  return problems.filter((problem) => problem.topic === topic);
}

/** Same topic as `slug`, excluding it. Falls back to nothing if the topic is thin. */
export async function getRelatedProblems(
  slug: string,
  limit = 3,
): Promise<Problem[]> {
  const problems = await loadProblems();
  const current = problems.find((problem) => problem.slug === slug);
  if (!current) return [];
  return problems
    .filter((p) => p.slug !== slug && p.topic === current.topic)
    .slice(0, limit);
}

export async function getTopicCounts(): Promise<Record<Topic, number>> {
  const problems = await loadProblems();
  const counts = Object.fromEntries(
    TOPICS.map((topic) => [topic, 0]),
  ) as Record<Topic, number>;
  for (const problem of problems) counts[problem.topic] += 1;
  return counts;
}

/** Most-solved problems, for the homepage "Trending" row. */
export async function getTrendingProblems(limit = 6): Promise<Problem[]> {
  const problems = await loadProblems();
  return [...problems]
    .sort((a, b) => (b.solveCount ?? 0) - (a.solveCount ?? 0))
    .slice(0, limit);
}

/**
 * Problems that have a video. A problem counts as filmed once `videoSeconds`
 * is set; `tiktokUrl` may still be empty, in which case <TikTokEmbed> renders
 * the designed placeholder instead of a live embed.
 */
export async function getProblemVideos(): Promise<Problem[]> {
  const problems = await loadProblems();
  return problems.filter((problem) => problem.videoSeconds !== undefined);
}

/** Total solves across the library, for the footer and stat rows. */
export async function getSolveTotal(): Promise<number> {
  const problems = await loadProblems();
  return problems.reduce((sum, problem) => sum + (problem.solveCount ?? 0), 0);
}

export async function getProblemCount(): Promise<number> {
  return (await loadProblems()).length;
}
