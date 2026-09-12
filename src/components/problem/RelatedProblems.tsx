import { ProblemCard } from "@/components/problem/ProblemCard";
import { topicLabel } from "@/lib/topics";
import type { Problem } from "@/lib/types";

/** More of the same topic, at the foot of a problem page. */
export function RelatedProblems({
  problems,
  topic,
}: {
  problems: Problem[];
  topic: Problem["topic"];
}) {
  if (!problems.length) return null;

  return (
    <section className="mt-16 border-t-2 border-ink pt-10">
      <h2 className="mb-6 text-[1.4rem]">
        More {topicLabel(topic).toLowerCase()}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map((problem) => (
          <li key={problem.slug}>
            <ProblemCard problem={problem} />
          </li>
        ))}
      </ul>
    </section>
  );
}
