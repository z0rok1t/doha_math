"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_LINKS } from "@/lib/nav";

/**
 * Desktop links. The red rule wipes in on hover (the mockup's behaviour) and
 * stays put on the section you're currently in.
 */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="hidden items-center gap-8 wide:flex">
      {NAV_LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className="group relative pb-[3px] text-[0.95rem] font-medium"
          >
            {link.label}
            <span
              aria-hidden="true"
              className={cn(
                "absolute bottom-0 left-0 h-[2px] bg-red transition-[width] duration-200",
                active ? "w-full" : "w-0 group-hover:w-full",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
