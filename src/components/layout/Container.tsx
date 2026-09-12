import { cn } from "@/lib/cn";

/** The mockup's `.wrap`: centred, 1180px max, gutters that tighten on mobile. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-wrap px-6 wide:px-8", className)}>
      {children}
    </div>
  );
}
