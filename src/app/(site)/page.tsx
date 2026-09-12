import { ProblemOfDayBand } from "@/components/daily/ProblemOfDayBand";
import { AboutStrip } from "@/components/home/AboutStrip";
import { ChallengePreview } from "@/components/home/ChallengePreview";
import { Hero } from "@/components/home/Hero";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { TopicGrid } from "@/components/home/TopicGrid";
import { TrendingVideos } from "@/components/home/TrendingVideos";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import {
  getCurrentChallenge,
  isChallengeOpen,
} from "@/lib/data/challenges";
import { getTodayDaily } from "@/lib/data/daily";
import {
  getAllProblems,
  getTopicCounts,
  getTrendingProblems,
} from "@/lib/data/problems";
import { getSiteContent } from "@/lib/data/site";
import { pickHeroProblem } from "@/lib/glyph";

// The page shows today's daily problem, so it re-renders hourly rather than
// being frozen at build time.
export const revalidate = 3600;

export default async function HomePage() {
  const [site, problems, trending, topicCounts, daily, challenge] =
    await Promise.all([
      getSiteContent(),
      getAllProblems(),
      getTrendingProblems(6),
      getTopicCounts(),
      getTodayDaily(),
      getCurrentChallenge(),
    ]);

  const heroFeatured = pickHeroProblem(problems);

  return (
    <>
      {heroFeatured && daily ? (
        <Hero site={site} featured={heroFeatured} daily={daily.problem} />
      ) : null}

      {daily ? (
        <Section id="problems" className="py-0 pb-[76px]">
          <Container>
            <ProblemOfDayBand entry={daily} />
          </Container>
        </Section>
      ) : null}

      <TrendingVideos problems={trending} />

      <TopicGrid counts={topicCounts} />

      {challenge ? (
        <ChallengePreview
          challenge={challenge}
          open={isChallengeOpen(challenge)}
        />
      ) : null}

      <AboutStrip site={site} />

      <Section alt>
        <Container>
          <NewsletterSignup site={site} />
        </Container>
      </Section>
    </>
  );
}
