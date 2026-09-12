import { ChallengeCard } from "@/components/challenge/ChallengeCard";
import { Leaderboard } from "@/components/challenge/Leaderboard";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { Challenge } from "@/lib/types";

export function ChallengePreview({
  challenge,
  open,
}: {
  challenge: Challenge;
  open: boolean;
}) {
  return (
    <Section alt id="challenge">
      <Container>
        <SectionHeading
          title="This week, everyone's racing the same clock"
          sub="New challenge drops every Monday. Solve it, submit your time, see where you land."
          action={{ href: "/challenges", label: "Past challenges →" }}
        />
        <div className="grid gap-[30px] wide:grid-cols-[1fr_0.85fr]">
          <ChallengeCard
            challenge={challenge}
            open={open}
            action={{ href: "/challenges", label: "Join the challenge" }}
          />
          {/* Placeholder standings — see Leaderboard.tsx. */}
          <Leaderboard rows={challenge.leaderboard} />
        </div>
      </Container>
    </Section>
  );
}
