import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "ink" | "red" | "ghost" | "paper";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-ctl border-2 px-5 py-[11px] text-[0.92rem] font-semibold leading-none transition-transform duration-150 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60";

const VARIANTS: Record<Variant, string> = {
  ink: "bg-ink text-paper border-ink",
  red: "bg-red text-paper border-red-dark",
  ghost: "bg-transparent text-ink border-ink",
  // For use on a red surface — the challenge card's inverted CTA.
  paper: "bg-card text-red border-card",
};

export function Button({
  variant = "ink",
  className,
  children,
  ...props
}: { variant?: Variant } & React.ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "ink",
  className,
  children,
  ...props
}: { variant?: Variant } & React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link className={cn(BASE, VARIANTS[variant], className)} {...props}>
      {children}
    </Link>
  );
}
