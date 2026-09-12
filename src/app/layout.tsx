import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, Inter } from "next/font/google";
// Imported before globals.css on purpose: our KaTeX overrides are unlayered
// and must come later in source order to win the cascade.
import "katex/dist/katex.min.css";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// IBM Plex Mono has no variable axis, so weights are listed explicitly.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mira Solves — Math that hits different",
    template: "%s · Mira Solves",
  },
  description:
    "Every problem from the videos — typed up, worked through, and waiting for you to try it first.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // Next 16 no longer forces scroll-behavior:auto during route changes;
      // this opts back in so in-page smooth scrolling doesn't make navigation
      // feel sluggish.
      data-scroll-behavior="smooth"
      className={`${bricolage.variable} ${inter.variable} ${plexMono.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        {/*
          Framer Motion server-renders its `initial` variant as an inline
          style, so anything with an entrance animation ships as opacity 0 and
          only becomes visible once JS hydrates. Without this, a visitor with
          scripting unavailable would see an empty hero.

          The selector matches on the inline style Framer emits, so it hits
          exactly the elements it hid and leaves the design's deliberate tilts
          (which come from classes, not inline styles) alone. !important is
          needed because inline styles otherwise win, and the whole thing sits
          in <noscript> so it never touches the real animation.
        */}
        <noscript>
          <style>{`.js-entrance [style*="opacity:0"], .js-entrance [style*="opacity: 0"] { opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        {/* Site chrome lives in (site)/layout.tsx and admin chrome in
            (admin)/layout.tsx, so /admin does not inherit the public nav. */}
        {children}
      </body>
    </html>
  );
}
