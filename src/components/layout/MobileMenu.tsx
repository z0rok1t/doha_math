"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DAILY_CTA, NAV_LINKS } from "@/lib/nav";

/**
 * Below 880px the mockup hid the nav links and left a `.burger` placeholder
 * that was never built. This is that menu: a plain disclosure, no animation,
 * since the deliberate motion moments belong to the hero and the solution
 * reveal.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on Escape while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="wide:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-ctl border-2 border-ink"
      >
        <span
          aria-hidden="true"
          className={cn(
            "h-[2px] w-4 bg-ink transition-transform duration-150",
            open && "translate-y-[7px] rotate-45",
          )}
        />
        <span
          aria-hidden="true"
          className={cn("h-[2px] w-4 bg-ink", open && "opacity-0")}
        />
        <span
          aria-hidden="true"
          className={cn(
            "h-[2px] w-4 bg-ink transition-transform duration-150",
            open && "-translate-y-[7px] -rotate-45",
          )}
        />
      </button>

      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute left-0 right-0 top-full border-b-2 border-ink bg-paper px-6 pb-5 pt-2"
      >
        <nav aria-label="Main" className="flex flex-col">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === link.href ? "page" : undefined}
              className="border-b border-line py-3 font-medium aria-[current=page]:text-red"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={DAILY_CTA.href}
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex items-center justify-center rounded-ctl border-2 border-red-dark bg-red px-5 py-3 font-semibold text-paper"
          >
            {DAILY_CTA.label}
          </Link>
        </nav>
      </div>
    </div>
  );
}
