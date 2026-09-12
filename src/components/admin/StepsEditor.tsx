"use client";

import { useState } from "react";
import { MathPreview } from "@/components/admin/MathPreview";
import { monoInputClass } from "@/components/admin/Field";
import { cn } from "@/lib/cn";

/**
 * The solution, one revealable step per entry.
 *
 * Order matters — it is the order a reader unlocks them in — so reordering is
 * a first-class control rather than something you achieve by retyping. Each
 * step gets its own preview, because a step is where the fiddly LaTeX lives.
 */
export function StepsEditor({
  steps,
  onChange,
  error,
}: {
  steps: string[];
  onChange: (next: string[]) => void;
  error?: string;
}) {
  const [previewing, setPreviewing] = useState<number | null>(null);

  function update(index: number, value: string) {
    onChange(steps.map((step, i) => (i === index ? value : step)));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= steps.length) return;
    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    if (previewing === index) setPreviewing(target);
  }

  function remove(index: number) {
    onChange(steps.filter((_, i) => i !== index));
    setPreviewing(null);
  }

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft">
          Solution steps ({steps.length})
        </h2>
        <button
          type="button"
          onClick={() => onChange([...steps, ""])}
          className="rounded-ctl border-2 border-ink px-3 py-1.5 font-mono text-[0.72rem] uppercase hover:bg-ink hover:text-paper"
        >
          Add step
        </button>
      </div>

      {error ? (
        <p role="alert" className="mb-3 text-[0.8rem] font-medium text-red-dark">
          {error}
        </p>
      ) : null}

      {steps.length === 0 ? (
        <p className="rounded-panel border-2 border-dashed border-line bg-card px-5 py-8 text-center text-ink-soft">
          No steps yet. A problem needs at least one.
        </p>
      ) : (
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li
              key={index}
              className="rounded-panel border-2 border-ink bg-card p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft">
                  Step {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <IconButton
                    label={`Move step ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    ↑
                  </IconButton>
                  <IconButton
                    label={`Move step ${index + 1} down`}
                    disabled={index === steps.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    ↓
                  </IconButton>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewing(previewing === index ? null : index)
                    }
                    aria-pressed={previewing === index}
                    className={cn(
                      "rounded-ctl border-2 px-2.5 py-1 font-mono text-[0.68rem] uppercase",
                      previewing === index
                        ? "border-ink bg-ink text-paper"
                        : "border-line hover:border-ink",
                    )}
                  >
                    Preview
                  </button>
                  <IconButton
                    label={`Delete step ${index + 1}`}
                    onClick={() => remove(index)}
                    danger
                  >
                    ✕
                  </IconButton>
                </div>
              </div>

              <textarea
                value={step}
                onChange={(event) => update(index, event.target.value)}
                rows={3}
                spellCheck={false}
                placeholder="One step of the working. Inline maths in $…$, a centred block in $$…$$."
                className={cn(monoInputClass, "resize-y")}
              />

              {previewing === index ? (
                <div className="mt-3 rounded-ctl border-2 border-line bg-paper p-3">
                  <MathPreview text={step} />
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "h-7 w-7 rounded-ctl border-2 border-line font-mono text-[0.8rem] leading-none disabled:opacity-30",
        !disabled && (danger ? "hover:border-red hover:text-red" : "hover:border-ink"),
      )}
    >
      {children}
    </button>
  );
}
