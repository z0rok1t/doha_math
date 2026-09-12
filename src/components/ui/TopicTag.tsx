import { cn } from "@/lib/cn";
import { topicLabel } from "@/lib/topics";
import type { Topic } from "@/lib/types";

/** The small mono topic label from the mockup's video cards. */
export function TopicTag({
  topic,
  className,
}: {
  topic: Topic;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-[0.68rem] uppercase tracking-wide text-red-dark",
        className,
      )}
    >
      {topicLabel(topic)}
    </span>
  );
}
