"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { HeroVisual } from "@/components/home/HeroVisual";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/CheckStamp";
import { Stat } from "@/components/ui/Stat";
import type { Problem, SiteContent } from "@/lib/types";

/**
 * The homepage's single orchestrated entrance: each block of the hero fades and
 * slides up in sequence on first load. This is the only scroll/entrance
 * animation on the page — nothing else fades in as you scroll.
 */
const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export function Hero({
  site,
  featured,
  daily,
}: {
  site: SiteContent;
  featured: Problem;
  daily: Problem;
}) {
  const reduceMotion = useReducedMotion();

  /**
   * Reduced motion skips the *initial* state, not the animation props.
   *
   * `initial={false}` tells Framer to paint the finished state straight away.
   * Dropping `variants`/`animate` instead would be a bug: on the first client
   * render useReducedMotion is still false, so Framer would apply opacity 0,
   * and once the props disappeared it would stop managing the element — the
   * inline opacity 0 would stick and the hero would stay invisible.
   */
  const motionProps = {
    variants: container,
    initial: reduceMotion ? (false as const) : ("hidden" as const),
    animate: "show" as const,
  };
  const childProps = { variants: item };

  return (
    <section className="pb-[90px] pt-[96px]">
      <Container>
        <motion.div
          {...motionProps}
          className="js-entrance grid items-center gap-[50px] wide:grid-cols-[1.05fr_0.95fr]"
        >
          <div>
            <motion.div {...childProps}>
              <span className="mb-[22px] inline-flex -rotate-[1.5deg] items-center gap-2 rounded-mark border-[1.5px] border-ink bg-yellow px-2.5 py-[5px] font-mono text-[0.78rem]">
                {site.hero.eyebrow}
              </span>
            </motion.div>

            <motion.h1
              {...childProps}
              className="mb-[22px] text-[clamp(2.6rem,5.4vw,4.4rem)]"
            >
              {site.hero.headlineLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block">
                <span className="italic text-red">
                  {site.hero.headlineAccent}
                </span>
                {site.hero.headlineAccentSuffix}
              </span>
            </motion.h1>

            <motion.p
              {...childProps}
              className="mb-[34px] max-w-[460px] text-[1.15rem] text-ink-soft"
            >
              {site.hero.sub}
            </motion.p>

            <motion.div
              {...childProps}
              className="mb-[38px] flex flex-wrap gap-3.5"
            >
              <ButtonLink href="/daily" variant="red">
                Try today&apos;s problem
                <CheckIcon />
              </ButtonLink>
              <ButtonLink href="/watch" variant="ghost">
                Watch the videos
              </ButtonLink>
            </motion.div>

            <motion.div
              {...childProps}
              className="flex flex-wrap gap-8 border-t-2 border-ink pt-[26px]"
            >
              {site.heroStats.map((stat) => (
                <Stat key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </motion.div>
          </div>

          <motion.div {...childProps}>
            <HeroVisual
              featured={featured}
              daily={daily}
              handle={site.handle}
            />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
