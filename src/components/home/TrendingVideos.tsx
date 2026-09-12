import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { VideoRow } from "@/components/video/VideoRow";
import type { Problem } from "@/lib/types";

export function TrendingVideos({ problems }: { problems: Problem[] }) {
  return (
    <Section alt id="watch">
      <Container>
        <SectionHeading
          title="Straight from the feed"
          sub="Every video, with a typed-up version underneath for when you want to read instead of watch."
          action={{ href: "/watch", label: "All videos →" }}
        />
        <VideoRow problems={problems} />
      </Container>
    </Section>
  );
}
