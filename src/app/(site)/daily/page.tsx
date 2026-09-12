import type { Metadata } from "next";
import Link from "next/link";
import { ProblemOfDayBand } from "@/components/daily/ProblemOfDayBand";
import { StreakCounter } from "@/components/daily/StreakCounter";
import { Container } from "@/components/layout/Container";
import { MathProse } from "@/components/problem/MathText";
import { ButtonLink } from "@/components/ui/Button";
import { getDailyArchive, getTodayDaily } from "@/lib/data/daily";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Today's problem",
  description:
    "One problem a day, with a streak that lives in your browser. No account needed.",
};

// Today's problem changes daily, so the page re-renders hourly instead of
// being frozen at build time.
export const revalidate = 3600;

export default async function DailyPage() {
  const [today, archive] = await Promise.all([
    getTodayDaily(),
    getDailyArchive(),
  ]);

  if (!today) {
    return (
      <Container className="py-14">
        <h1 className="text-[clamp(2rem,4vw,3rem)]">No problem scheduled</h1>
        <p className="mt-3 text-ink-soft">
          Nothing is on the calendar yet. Add a date to{" "}
          <code className="font-mono text-[0.9em]">content/daily.json</code>.
        </p>
      </Container>
    );
  }

  return (
    <Container className="py-14">
      <div className="mx-auto max-w-[1000px]">
        <header className="mb-8">
          <div className="mb-2.5 font-mono text-[0.78rem] uppercase tracking-wide text-ink-soft">
            {formatDate(today.date)}
          </div>
          <h1 className="text-[clamp(2rem,4vw,3rem)]">Today&apos;s problem</h1>
        </header>

        <ProblemOfDayBand entry={today} rightSlot={<StreakCounter />} />

        <div className="mt-10 grid gap-10 wide:grid-cols-[minmax(0,1fr)_320px] wide:gap-14 wide:items-start">
          <div className="min-w-0 max-w-[640px]">
            <div className="rounded-panel border-2 border-ink bg-card p-6">
              <div className="mb-3 font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft">
                Problem #{today.problem.number}
              </div>
              <h2 className="mb-4 text-[1.3rem]">{today.problem.title}</h2>
              <MathProse
                text={today.problem.statement}
                className="text-[1.05rem]"
              />
              <div className="mt-6">
                <ButtonLink
                  href={`/problems/${today.problem.slug}`}
                  variant="red"
                >
                  Open the scratchpad
                </ButtonLink>
              </div>
            </div>
          </div>

          <aside className="rounded-panel border-2 border-ink bg-paper-alt p-6">
            <h2 className="mb-3 text-[1.1rem]">How the streak works</h2>
            <p className="mb-4 text-[0.92rem] text-ink-soft">
              Mark a problem solved and your streak goes up by one. Come back
              the next day to keep it; miss a day and it starts again at one.
            </p>
            <p className="mb-5 font-mono text-[0.7rem] uppercase leading-relaxed text-ink-soft">
              Stored in this browser only. No account, no email, nothing sent
              anywhere. Clearing site data clears the streak.
            </p>
            {archive.length ? (
              <Link
                href="/daily/archive"
                className="border-b-2 border-ink pb-px font-mono text-[0.78rem] uppercase hover:text-red"
              >
                {archive.length} past problems &rarr;
              </Link>
            ) : null}
          </aside>
        </div>
      </div>
    </Container>
  );
}
