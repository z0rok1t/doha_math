import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { VideoLibrary } from "@/components/video/VideoLibrary";
import { getProblemVideos } from "@/lib/data/problems";

export const metadata: Metadata = {
  title: "Watch",
  description:
    "Every video from the channel, each one linked to the written problem underneath.",
};

export default async function WatchPage() {
  const videos = await getProblemVideos();

  return (
    <Container className="py-14">
      <header className="mb-10">
        <h1 className="text-[clamp(2rem,4vw,3rem)]">Every video</h1>
        <p className="mt-3 max-w-[520px] text-ink-soft">
          The whole feed, in one place. Each card opens the written version,
          where you can try it before the solution shows up.
        </p>
      </header>

      <VideoLibrary problems={videos} />
    </Container>
  );
}
