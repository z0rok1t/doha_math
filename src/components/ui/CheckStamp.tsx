import { cn } from "@/lib/cn";

/** The red-pen tick used for every "solved" state. */
export function CheckIcon({
  className,
  strokeWidth = 2.4,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={cn("h-4 w-4", className)}
    >
      <path
        d="M4 10.5L8 14.5L16 5.5"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A circled tick — the mockup's `.solved .circle`. */
export function CheckStamp({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-red text-red",
        className,
      )}
    >
      <CheckIcon className="h-[11px] w-[11px]" strokeWidth={2.6} />
    </span>
  );
}
