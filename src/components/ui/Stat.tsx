import { cn } from "@/lib/cn";

/** A display-face number over a mono caption. Used by the hero and /about. */
export function Stat({
  value,
  label,
  className,
  valueClassName,
}: {
  value: string;
  label: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={className}>
      <b
        className={cn(
          "block font-display text-[1.7rem] font-bold leading-none",
          valueClassName,
        )}
      >
        {value}
      </b>
      <span className="mt-1 block font-mono text-[0.8rem] text-ink-soft">
        {label}
      </span>
    </div>
  );
}
