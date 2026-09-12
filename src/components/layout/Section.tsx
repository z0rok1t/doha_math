import { cn } from "@/lib/cn";

/**
 * A page band. `alt` is the mockup's `section.alt`: the warmer paper tone
 * fenced by hard 2px rules, used to alternate the rhythm down the page.
 */
export function Section({
  alt = false,
  id,
  className,
  children,
}: {
  alt?: boolean;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-14 wide:py-[76px]",
        alt && "border-y-2 border-ink bg-paper-alt",
        className,
      )}
    >
      {children}
    </section>
  );
}
