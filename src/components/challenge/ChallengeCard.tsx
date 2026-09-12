import { MathText } from "@/components/problem/MathText";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { Challenge } from "@/lib/types";

/** The red challenge card from the mockup, reused on the homepage and /challenges. */
export function ChallengeCard({
  challenge,
  open,
  action,
  className,
}: {
  challenge: Challenge;
  open: boolean;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-panel bg-red p-9 text-paper",
        className,
      )}
    >
      <div>
        <div className="mb-[18px] inline-block w-fit rounded-mark bg-white/20 px-2.5 py-1 font-mono text-[0.78rem] uppercase">
          {challenge.week} ·{" "}
          {open
            ? `ends ${formatDate(challenge.closesAt)}`
            : `closed ${formatDate(challenge.closesAt)}`}
        </div>
        <h3 className="mb-3.5 text-[1.7rem]">{challenge.title}</h3>
        <MathText
          as="p"
          text={challenge.prompt}
          className="mb-6 max-w-[340px] opacity-90"
        />
      </div>
      {action ? (
        <ButtonLink href={action.href} variant="paper" className="w-fit">
          {action.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}
