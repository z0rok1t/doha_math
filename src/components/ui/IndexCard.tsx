import { cn } from "@/lib/cn";

/**
 * The signature "index card": white stock, 2px ink border, slight tilt and a
 * hard offset colour block behind it — never a soft blur shadow.
 *
 * Every card surface on the site composes this, so tilt and shadow colour are
 * props rather than re-declared per section.
 */
type Tilt = "none" | "left" | "left-sm" | "left-xs" | "right" | "right-xs";
type Shadow = "none" | "red" | "blue" | "yellow" | "ink";

const TILTS: Record<Tilt, string> = {
  none: "",
  left: "-rotate-6",
  "left-sm": "-rotate-2",
  "left-xs": "-rotate-[1.5deg]",
  right: "rotate-3",
  "right-xs": "rotate-1",
};

const SHADOWS: Record<Shadow, string> = {
  none: "",
  red: "shadow-block-red",
  blue: "shadow-block-blue",
  yellow: "shadow-card-yellow",
  ink: "shadow-block-ink",
};

export function IndexCard({
  tilt = "none",
  shadow = "none",
  className,
  children,
}: {
  tilt?: Tilt;
  shadow?: Shadow;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border-2 border-ink bg-card",
        TILTS[tilt],
        SHADOWS[shadow],
        className,
      )}
    >
      {children}
    </div>
  );
}
