import { loadChallenges } from "@/lib/data/source";
import { todayIso } from "@/lib/format";
import type { Challenge } from "@/lib/types";

/** All challenges, most recent first. */
export async function getAllChallenges(): Promise<Challenge[]> {
  return loadChallenges();
}

export async function getChallengeBySlug(
  slug: string,
): Promise<Challenge | null> {
  const challenges = await loadChallenges();
  return challenges.find((challenge) => challenge.slug === slug) ?? null;
}

/** True while today falls inside the challenge's open window. */
export function isChallengeOpen(
  challenge: Challenge,
  date: string = todayIso(),
): boolean {
  return challenge.opensAt <= date && date <= challenge.closesAt;
}

/**
 * The challenge to feature. Prefers one that's currently open; otherwise the
 * most recently opened, so the page always has something to show.
 */
export async function getCurrentChallenge(): Promise<Challenge | null> {
  const challenges = await loadChallenges();
  if (!challenges.length) return null;
  return challenges.find((challenge) => isChallengeOpen(challenge)) ?? challenges[0];
}

export async function getPastChallenges(): Promise<Challenge[]> {
  const challenges = await loadChallenges();
  const current = await getCurrentChallenge();
  return challenges.filter((challenge) => challenge.slug !== current?.slug);
}
