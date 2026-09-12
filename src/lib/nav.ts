/** Primary navigation, matching the mockup's four links plus the daily CTA. */
export const NAV_LINKS = [
  { href: "/problems", label: "Problems" },
  { href: "/watch", label: "Watch" },
  { href: "/challenges", label: "Challenges" },
  { href: "/about", label: "About" },
] as const;

export const DAILY_CTA = {
  href: "/daily",
  label: "Start today's problem",
} as const;

/**
 * Footer columns. The mockup listed a "Community" link; community features are
 * v2 scope, so that slot points at the daily problem instead of shipping a
 * link to nothing.
 */
export const FOOTER_EXPLORE = [
  { href: "/problems", label: "Problems" },
  { href: "/watch", label: "Watch" },
  { href: "/challenges", label: "Challenges" },
  { href: "/daily", label: "Today's problem" },
] as const;

export const FOOTER_SITE = [
  { href: "/about", label: "About" },
  { href: "/#newsletter", label: "Newsletter" },
] as const;
