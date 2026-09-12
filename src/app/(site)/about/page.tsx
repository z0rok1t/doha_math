import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Stat } from "@/components/ui/Stat";
import { getProblemCount, getSolveTotal } from "@/lib/data/problems";
import { getSiteContent } from "@/lib/data/site";
import { formatCount, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "About",
  description: "Who Mira is, and why the problems come before the answers.",
};

export default async function AboutPage() {
  const [site, problemCount, solveTotal] = await Promise.all([
    getSiteContent(),
    getProblemCount(),
    getSolveTotal(),
  ]);

  return (
    <Container className="py-14">
      <div className="grid gap-12 wide:grid-cols-[300px_1fr] wide:items-start">
        {/* Gradient stand-in: no photograph was supplied with the design. */}
        <div
          role="img"
          aria-label={`Portrait of ${site.name}`}
          className="aspect-[4/5] w-full rounded-panel border-2 border-ink bg-[linear-gradient(155deg,var(--color-yellow),var(--color-red))]"
        />

        <div className="min-w-0">
          <h1 className="mb-6 text-[clamp(2rem,4vw,3rem)]">
            {site.about.heading}
          </h1>

          <div className="max-w-measure space-y-4 text-[1.05rem] text-ink-soft">
            {site.about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-9 border-t-2 border-ink pt-6">
            {site.about.stats.map((stat) => (
              <Stat
                key={stat.label}
                value={stat.value}
                label={stat.label}
                valueClassName="text-[1.6rem]"
              />
            ))}
          </div>

          {/* Counted from the content library itself, so these two can't drift
              out of date the way the hand-written stats above can. */}
          <div className="mt-6 flex flex-wrap gap-9">
            <Stat
              value={String(problemCount)}
              label="PROBLEMS ON THE SITE"
              valueClassName="text-[1.6rem]"
            />
            <Stat
              value={formatCount(solveTotal)}
              label="SOLVES RECORDED"
              valueClassName="text-[1.6rem]"
            />
          </div>

          <section className="mt-12 border-t-2 border-ink pt-8">
            <h2 className="mb-4 text-[1.4rem]">Elsewhere</h2>
            <ul className="flex flex-wrap gap-4">
              {site.socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 rounded-ctl border-2 border-ink bg-card px-4 py-2 text-[0.9rem] font-semibold transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-block-red"
                  >
                    {social.platform}
                    <span className="font-mono text-[0.72rem] text-ink-soft">
                      {social.handle}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12 border-t-2 border-ink pt-8">
            <h2 className="mb-4 text-[1.4rem]">Press</h2>
            <ul className="divide-y divide-line">
              {site.press.map((item) => (
                <li key={item.url} className="py-3.5">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex flex-wrap items-baseline gap-x-4 gap-y-1"
                  >
                    <span className="w-[130px] shrink-0 font-mono text-[0.72rem] uppercase text-red-dark">
                      {item.outlet}
                    </span>
                    <span className="flex-1 font-medium underline-offset-4 group-hover:underline">
                      {item.title}
                    </span>
                    <span className="font-mono text-[0.7rem] uppercase text-ink-soft">
                      {formatDate(item.date)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </Container>
  );
}
