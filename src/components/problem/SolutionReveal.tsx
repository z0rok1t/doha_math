"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MathProse } from "@/components/problem/MathText";
import { Scratchpad } from "@/components/problem/Scratchpad";
import { Button } from "@/components/ui/Button";
import { CheckIcon, CheckStamp } from "@/components/ui/CheckStamp";

/**
 * The try-it-yourself interaction — the core feature of the site.
 *
 * Rules it follows:
 *
 * 1. The scratchpad is visible from the start; the solution is not.
 * 2. Steps are *conditionally rendered*, never CSS-hidden, so no step markup
 *    exists in the document until you ask for it: Ctrl-F finds nothing, reader
 *    mode shows nothing, and a screen reader cannot read ahead.
 *
 *    Worth being precise about the limit: the step text still ships inside the
 *    serialized props in the page source, because this is a client component
 *    receiving `steps` from the server. Someone who opens view-source or
 *    devtools can read it. That is a deliberate trade — the solutions are
 *    public teaching content, and the reveal exists to encourage an honest
 *    attempt, not to lock anything away. Keeping it in the payload makes the
 *    reveal instant and gives it no failure modes.
 *
 *    TODO: if the answer should genuinely not be in the page, move `steps`
 *    behind an on-demand fetch — a route handler returning the steps for a
 *    slug, called on first reveal and cached client-side for the remaining
 *    step-by-step walk. Costs a round trip on the first click and needs
 *    loading/error states, so it was not worth it for v1.
 * 3. Revealing walks one step at a time. "Reveal all" is always there for
 *    people who just want the answer.
 * 4. Focus moves to each newly revealed step so a keyboard or screen-reader
 *    user lands on the new content instead of hunting for it. (Focus movement
 *    does the announcing here — an aria-live region on the same content would
 *    make screen readers say it twice.)
 * 5. It is reversible: hiding the solution puts the problem back.
 */
export function SolutionReveal({
  slug,
  steps,
}: {
  slug: string;
  steps: string[];
}) {
  const total = steps.length;
  const [revealed, setRevealed] = useState(0);
  const reduceMotion = useReducedMotion();

  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  // Index of the step that should take focus once it has rendered.
  const pendingFocus = useRef<number | null>(null);

  useEffect(() => {
    if (pendingFocus.current === null) return;
    stepRefs.current[pendingFocus.current]?.focus();
    pendingFocus.current = null;
  }, [revealed]);

  const complete = revealed === total;

  function revealNext() {
    pendingFocus.current = revealed;
    setRevealed((current) => Math.min(current + 1, total));
  }

  function revealAll() {
    pendingFocus.current = revealed;
    setRevealed(total);
  }

  function hideSolution() {
    setRevealed(0);
  }

  return (
    <div className="space-y-6">
      <Scratchpad slug={slug} />

      <section aria-labelledby={`solution-heading-${slug}`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2
            id={`solution-heading-${slug}`}
            className="text-[1.4rem]"
          >
            The solution
          </h2>
          {revealed > 0 ? (
            <span className="font-mono text-[0.74rem] uppercase tracking-wide text-ink-soft">
              Step {revealed} / {total}
            </span>
          ) : null}
        </div>

        {revealed === 0 ? (
          <div className="rounded-panel border-2 border-dashed border-line bg-card p-6 text-center">
            <p className="mx-auto mb-5 max-w-[380px] text-ink-soft">
              Had a real go first — that is the whole point. The working is
              broken into {total} steps, so you can take just the nudge you
              need.
            </p>
            <Button variant="red" onClick={revealNext}>
              Reveal solution
              <CheckIcon />
            </Button>
          </div>
        ) : (
          <>
            <ol className="space-y-4">
              <AnimatePresence initial={false}>
                {steps.slice(0, revealed).map((step, index) => (
                  <motion.li
                    key={index}
                    ref={(element) => {
                      stepRefs.current[index] = element;
                    }}
                    tabIndex={-1}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="rounded-panel border-2 border-ink bg-card p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
                  >
                    <div className="mb-2.5 flex items-center gap-2">
                      <CheckStamp />
                      <span className="font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft">
                        Step {index + 1}
                      </span>
                    </div>
                    <MathProse text={step} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {complete ? (
                <p className="flex items-center gap-2 font-semibold text-red-dark">
                  <CheckStamp />
                  That is the whole solution.
                </p>
              ) : (
                <>
                  <Button variant="red" onClick={revealNext}>
                    Next step
                  </Button>
                  <Button variant="ghost" onClick={revealAll}>
                    Reveal all {total}
                  </Button>
                </>
              )}
              <button
                type="button"
                onClick={hideSolution}
                className="ml-auto border-b-2 border-ink pb-px font-mono text-[0.74rem] uppercase hover:text-red"
              >
                Hide solution
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
