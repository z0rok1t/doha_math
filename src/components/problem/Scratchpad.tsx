"use client";

import { useEffect, useRef } from "react";
import { removeStorage, readStorage, writeStorage } from "@/lib/storage";

/**
 * Working space, shown by default — the whole point is that you try the
 * problem before the solution is available.
 *
 * The draft is kept in localStorage per problem so a refresh, or a trip to the
 * video and back, doesn't wipe your working. It is per-browser and never
 * leaves the device; there are no accounts in v1.
 *
 * The textarea is deliberately uncontrolled. A stored draft can't be the
 * server-rendered value (there is no localStorage on the server), so restoring
 * it means writing to the DOM after mount — which is exactly what an effect is
 * for. Holding the text in React state instead would mean calling setState
 * from an effect to seed it, causing a cascading render on every page load.
 *
 * TODO: with accounts, sync drafts server-side so working follows a solver
 * between devices. `storageKey` is already problem-scoped, so the stored shape
 * wouldn't change.
 */
export function Scratchpad({ slug }: { slug: string }) {
  const storageKey = `mira:scratch:${slug}`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore the saved draft once the component is on screen.
  useEffect(() => {
    const stored = readStorage(storageKey);
    const textarea = textareaRef.current;
    // Don't clobber anything already typed in the moment before this ran.
    if (stored && textarea && textarea.value === "") {
      textarea.value = stored;
    }
  }, [storageKey]);

  function persist(value: string) {
    if (value) writeStorage(storageKey, value);
    else removeStorage(storageKey);
  }

  return (
    <div className="rounded-panel border-2 border-ink bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <label
          htmlFor={`scratchpad-${slug}`}
          className="font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft"
        >
          Your working
        </label>
        <button
          type="button"
          onClick={() => {
            const textarea = textareaRef.current;
            if (textarea) textarea.value = "";
            removeStorage(storageKey);
            textarea?.focus();
          }}
          className="font-mono text-[0.72rem] uppercase text-ink-soft hover:text-red"
        >
          Clear
        </button>
      </div>

      <textarea
        id={`scratchpad-${slug}`}
        ref={textareaRef}
        onChange={(event) => persist(event.target.value)}
        rows={8}
        spellCheck={false}
        placeholder={
          "Start here. Draw the triangle, name the variables, guess and check — whatever gets you moving."
        }
        className="w-full resize-y rounded-ctl border-2 border-line bg-paper px-4 py-3 font-mono text-[0.88rem] leading-relaxed text-ink placeholder:text-ink-soft/70 focus:border-ink"
      />

      <p className="mt-2.5 font-mono text-[0.68rem] text-ink-soft">
        Saved in this browser only.
      </p>
    </div>
  );
}
