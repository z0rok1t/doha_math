import katex from "katex";
import { cn } from "@/lib/cn";

/**
 * Renders content-file text that mixes prose with math.
 *
 * `$...$` is inline math, `$$...$$` is display math; everything else is passed
 * through as text. Rendering happens on the server via katex.renderToString,
 * so math costs no client JavaScript and needs no hydration.
 */

// The capturing group makes String.split keep the delimiters it splits on.
const SEGMENT = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;

function render(tex: string, displayMode: boolean): string {
  return katex.renderToString(tex, {
    displayMode,
    // Renders a visible red error in place rather than failing the build over
    // a typo in a content file.
    throwOnError: false,
    strict: false,
  });
}

export function MathText({
  text,
  className,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  as?: "span" | "p" | "div";
}) {
  const segments = text.split(SEGMENT).filter((segment) => segment !== "");

  return (
    <Tag className={className}>
      {segments.map((segment, index) => {
        const key = `${index}-${segment.slice(0, 12)}`;

        if (segment.startsWith("$$") && segment.endsWith("$$")) {
          return (
            <span
              key={key}
              // Markup is produced by KaTeX from our own content files.
              dangerouslySetInnerHTML={{
                __html: render(segment.slice(2, -2), true),
              }}
            />
          );
        }

        if (segment.startsWith("$") && segment.endsWith("$")) {
          return (
            <span
              key={key}
              dangerouslySetInnerHTML={{
                __html: render(segment.slice(1, -1), false),
              }}
            />
          );
        }

        return <span key={key}>{segment}</span>;
      })}
    </Tag>
  );
}

/** Prose block for statements and solution steps. */
export function MathProse({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return <MathText as="p" text={text} className={cn("leading-relaxed", className)} />;
}
