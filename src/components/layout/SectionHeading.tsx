import Link from "next/link";

/** Heading + optional subhead on the left, optional "view all" link right. */
export function SectionHeading({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h2 className="text-[clamp(1.7rem,3vw,2.3rem)]">{title}</h2>
        {sub ? (
          <p className="mt-2 max-w-[480px] text-ink-soft">{sub}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="whitespace-nowrap border-b-2 border-ink pb-[2px] font-mono text-[0.85rem]"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
