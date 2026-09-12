"use client";

import { cn } from "@/lib/cn";

/** Toggle pill shared by the /problems filters and the /watch topic filter. */
export function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-ctl border-2 px-3 py-1.5 font-mono text-[0.74rem] uppercase tracking-wide transition-colors duration-150",
        active
          ? "border-ink bg-ink text-paper"
          : "border-line bg-card text-ink-soft hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
