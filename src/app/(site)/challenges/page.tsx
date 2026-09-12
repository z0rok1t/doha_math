import type { Metadata } from "next";
import { ChallengeCard } from "@/components/challenge/ChallengeCard";
import { Leaderboard } from "@/components/challenge/Leaderboard";
import { Container } from "@/components/layout/Container";
import { MathProse } from "@/components/problem/MathText";
import {
  getCurrentChallenge,
  getPastChallenges,
  isChallengeOpen,
} from "@/lib/data/challenges";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Challenges",
  description:
    "A new timed challenge every Monday, plus the archive of past ones.",
};

export const revalidate = 3600;

export default async function ChallengesPage() {
  const [current, past] = await Promise.all([
    getCurrentChallenge(),
    getPastChallenges(),
  ]);

  return (
    <Container className="py-14">
      <header className="mb-10">
        <h1 className="text-[clamp(2rem,4vw,3rem)]">Weekly challenges</h1>
        <p className="mt-3 max-w-[560px] text-ink-soft">
          One harder problem a week, dropping every Monday. Solve it however you
          like — the standings below are for bragging rights.
        </p>
      </header>

      {current ? (
        <div className="mb-16 grid gap-[30px] wide:grid-cols-[1fr_0.85fr]">
          <ChallengeCard challenge={current} open={isChallengeOpen(current)} />
          {/* Placeholder standings — see Leaderboard.tsx. */}
          <div>
            <Leaderboard rows={current.leaderboard} />
            <p className="mt-3 font-mono text-[0.68rem] uppercase leading-relaxed text-ink-soft">
              Standings are sample data. Submissions and timing are not built
              yet.
            </p>
          </div>
        </div>
      ) : null}

      {past.length ? (
        <section className="border-t-2 border-ink pt-10">
          <h2 className="mb-6 text-[1.5rem]">Past challenges</h2>
          <ul className="space-y-5">
            {past.map((challenge) => (
              <li
                key={challenge.slug}
                className="rounded-panel border-2 border-ink bg-card p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="text-[1.25rem]">{challenge.title}</h3>
                  <span className="font-mono text-[0.72rem] uppercase text-ink-soft">
                    {challenge.week} · closed {formatDate(challenge.closesAt)}
                  </span>
                </div>
                <MathProse
                  text={challenge.prompt}
                  className="mt-3 max-w-measure text-ink-soft"
                />
                {challenge.leaderboard.length ? (
                  <p className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[0.74rem] text-ink-soft">
                    <span className="uppercase">Won by</span>
                    <span className="font-semibold text-ink">
                      {challenge.leaderboard[0].handle}
                    </span>
                    <span>in {challenge.leaderboard[0].score}</span>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
