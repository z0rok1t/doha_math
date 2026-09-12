import Link from "next/link";
import { cn } from "@/lib/cn";

/** Wordmark plus the tilted red radical tile. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 font-display text-[1.25rem] font-extrabold",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-[34px] w-[34px] -rotate-[4deg] items-center justify-center rounded-mark bg-red font-mono text-[1.05rem] font-medium text-paper"
      >
        &radic;
      </span>
      Mira Solves
    </Link>
  );
}
