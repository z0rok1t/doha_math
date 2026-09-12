import { cn } from "@/lib/cn";

export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("h-5 w-5", className)}>
      <path d="M8 5L19 12L8 19V5Z" fill="currentColor" />
    </svg>
  );
}
