import Script from "next/script";
import { MathText } from "@/components/problem/MathText";
import { PlayIcon } from "@/components/ui/PlayIcon";
import { cn } from "@/lib/cn";

/**
 * One reusable surface for "where the video goes".
 *
 * With a real `url` it renders TikTok's official oEmbed blockquote and loads
 * their embed script once per page. Without one it renders the designed
 * placeholder from the mockup — the blue-to-ink gradient panel with the
 * problem's equation lettered across it — so the site looks finished while the
 * video links are still empty.
 *
 * None of the seed problems carry a `tiktokUrl` yet, so every embed on the site
 * is currently the placeholder. Filling in `tiktokUrl` in a content file is all
 * it takes to switch one over to the live embed: a data change, not a code one.
 */

const TIKTOK_VIDEO_ID = /\/video\/(\d+)/;

function extractVideoId(url: string): string | null {
  return url.match(TIKTOK_VIDEO_ID)?.[1] ?? null;
}

export function TikTokEmbed({
  url,
  glyph,
  caption,
  label,
  play = "corner",
  className,
}: {
  url?: string;
  glyph?: { text: string; isMath: boolean };
  caption?: string;
  /** Describes the video for assistive tech when showing the placeholder. */
  label?: string;
  /** "center" is the hero phone's larger play ring; "corner" is the card dot. */
  play?: "corner" | "center";
  className?: string;
}) {
  const videoId = url ? extractVideoId(url) : null;

  if (url && videoId) {
    return (
      <div className={cn("overflow-hidden", className)}>
        <blockquote
          className="tiktok-embed"
          cite={url}
          data-video-id={videoId}
          style={{ maxWidth: "605px", minWidth: "288px" }}
        >
          <section>
            <a href={url} target="_blank" rel="noreferrer noopener">
              Watch this problem on TikTok
            </a>
          </section>
        </blockquote>
        {/* One instance per page: the shared `id` lets Next dedupe it even
            when several embeds render together. */}
        <Script
          id="tiktok-embed-script"
          src="https://www.tiktok.com/embed.js"
          strategy="lazyOnload"
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={label ? `${label} — video coming soon` : "Video coming soon"}
      className={cn(
        // A column so the glyph and the centred play ring stack instead of
        // landing on top of each other.
        "relative flex flex-col items-center justify-center gap-5 overflow-hidden bg-[linear-gradient(150deg,var(--color-blue),var(--color-ink))]",
        className,
      )}
    >
      {glyph ? (
        glyph.isMath ? (
          <MathText
            text={glyph.text}
            className="px-4 text-center font-display text-[1.1rem] text-white/90"
          />
        ) : (
          <span className="px-4 text-center font-display text-[1.1rem] text-white/90">
            {glyph.text}
          </span>
        )
      ) : null}

      {play === "center" ? (
        <span
          aria-hidden="true"
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border-2 border-white/70 bg-white/15 text-white"
        >
          <PlayIcon className="h-5 w-5" />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-white bg-white/16 text-white"
        >
          <PlayIcon className="h-3.5 w-3.5" />
        </span>
      )}

      {caption ? (
        <span
          className={
            play === "center"
              ? "absolute bottom-3.5 left-3.5 right-3.5 font-mono text-[0.72rem] text-white/85"
              : "absolute bottom-3.5 left-14 right-3.5 font-mono text-[0.72rem] text-white/85"
          }
        >
          {caption}
        </span>
      ) : null}
    </div>
  );
}
