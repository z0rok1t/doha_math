import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { TopicIcon } from "@/components/ui/TopicIcon";
import { cn } from "@/lib/cn";
import { TOPIC_LIST } from "@/lib/topics";
import type { Topic } from "@/lib/types";

/**
 * Topic cards with the mockup's folded-corner detail.
 *
 * The mockup's hover only nudged the card; per the brief these also take the
 * hard offset colour block, tinted with each topic's own accent.
 */
export function TopicGrid({ counts }: { counts: Record<Topic, number> }) {
  return (
    <Section>
      <Container>
        <SectionHeading
          title="Pick your battlefield"
          sub="Every problem, sorted by topic. Filter by difficulty once you're inside."
          action={{ href: "/problems", label: "Browse all problems →" }}
        />

        <ul className="grid grid-cols-2 gap-[18px] lg:grid-cols-4">
          {TOPIC_LIST.map((topic) => (
            <li key={topic.slug}>
              <Link
                href={`/problems?topic=${topic.slug}`}
                className={cn(
                  "relative block h-full rounded-panel border-2 border-ink bg-card px-5 py-6 transition-[transform,box-shadow] duration-[160ms] hover:-translate-x-0.5 hover:-translate-y-0.5",
                  topic.hoverShadowClass,
                )}
              >
                {/* Folded corner: masks the card's own corner and redraws two
                    edges, so it reads as a clipped index-card corner. */}
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 h-[26px] w-[26px] rounded-bl-[6px] border-b-2 border-l-2 border-ink bg-card"
                />
                <TopicIcon
                  topic={topic.slug}
                  className={cn("mb-[18px]", topic.iconClass)}
                />
                <h3 className="mb-1.5 text-[1.12rem]">{topic.label}</h3>
                <div className="font-mono text-[0.78rem] text-ink-soft">
                  {counts[topic.slug]}{" "}
                  {counts[topic.slug] === 1 ? "PROBLEM" : "PROBLEMS"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
