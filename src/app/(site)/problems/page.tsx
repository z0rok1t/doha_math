import type { Metadata } from "next";
import { ProblemBrowser } from "@/components/problem/ProblemBrowser";
import { Container } from "@/components/layout/Container";
import { getAllProblems } from "@/lib/data/problems";
import { isTopic } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Problems",
  description:
    "Every problem from the videos, filterable by topic and difficulty.",
};

export default async function ProblemsPage(props: PageProps<"/problems">) {
  const [problems, searchParams] = await Promise.all([
    getAllProblems(),
    props.searchParams,
  ]);

  // The homepage's topic cards link here as /problems?topic=geometry.
  const requested = searchParams.topic;
  const topicParam = Array.isArray(requested) ? requested[0] : requested;
  const initialTopic =
    topicParam && isTopic(topicParam) ? topicParam : undefined;

  return (
    <Container className="py-14">
      <header className="mb-10">
        <h1 className="text-[clamp(2rem,4vw,3rem)]">The whole library</h1>
        <p className="mt-3 max-w-[520px] text-ink-soft">
          Every problem that has been on the channel, typed up and worked
          through. Filter it down, or switch to the table if you would rather
          scan.
        </p>
      </header>

      <ProblemBrowser problems={problems} initialTopic={initialTopic} />
    </Container>
  );
}
