import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavLinks } from "@/components/layout/NavLinks";
import { ButtonLink } from "@/components/ui/Button";
import { DAILY_CTA } from "@/lib/nav";

/** Sticky header: translucent paper over a hard 2px ink rule. */
export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/92 backdrop-blur-[6px]">
      <div className="mx-auto flex max-w-wrap items-center justify-between gap-4 px-6 py-[18px] wide:px-8">
        <Logo />
        <NavLinks />
        <div className="flex items-center gap-4">
          <ButtonLink
            href={DAILY_CTA.href}
            variant="red"
            className="hidden wide:inline-flex"
          >
            {DAILY_CTA.label}
          </ButtonLink>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
