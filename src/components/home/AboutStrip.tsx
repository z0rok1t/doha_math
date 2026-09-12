import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import type { SiteContent } from "@/lib/types";

/**
 * Short about block. The portrait is the mockup's gradient placeholder — no
 * photograph was supplied, so the slot keeps its shape and accent rather than
 * showing a broken image.
 */
export function AboutStrip({ site }: { site: SiteContent }) {
  return (
    <Section id="about">
      <Container>
        <div className="grid items-center gap-[50px] wide:grid-cols-[0.7fr_1.3fr]">
          <div
            role="img"
            aria-label={`Portrait of ${site.name}`}
            className="aspect-[4/5] w-full max-w-[280px] rounded-panel border-2 border-ink bg-[linear-gradient(155deg,var(--color-yellow),var(--color-red))]"
          />
          <div>
            <h2 className="mb-[18px] text-[2rem]">{site.about.heading}</h2>
            <p className="mb-[26px] max-w-[520px] text-ink-soft">
              {site.about.shortParagraph}
            </p>
            <div className="mb-8 flex flex-wrap gap-9">
              {site.about.stats.map((stat) => (
                <Stat
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  valueClassName="text-[1.6rem]"
                />
              ))}
            </div>
            <ButtonLink href="/about" variant="ghost">
              More about Mira
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
