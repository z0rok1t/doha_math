import { VideoCard } from "@/components/video/VideoCard";
import type { Problem } from "@/lib/types";

/** Horizontally scrolling row of video cards (the mockup's `.video-row`). */
export function VideoRow({ problems }: { problems: Problem[] }) {
  return (
    <ul className="hide-scrollbar -mx-6 flex gap-5 overflow-x-auto px-6 pb-2.5 wide:-mx-8 wide:px-8">
      {problems.map((problem) => (
        <li key={problem.slug} className="flex-none">
          <VideoCard problem={problem} className="w-[210px]" />
        </li>
      ))}
    </ul>
  );
}
