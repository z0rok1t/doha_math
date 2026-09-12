import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { getProblemCount } from "@/lib/data/problems";
import { getSiteContent } from "@/lib/data/site";
import { FOOTER_EXPLORE, FOOTER_SITE } from "@/lib/nav";

function Column({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="mb-3 font-mono text-[0.78rem] text-ink-soft">{heading}</h4>
      {children}
    </div>
  );
}

const LINK_CLASS = "mb-2 block text-[0.9rem] hover:text-red";

export async function Footer() {
  const [site, problemCount] = await Promise.all([
    getSiteContent(),
    getProblemCount(),
  ]);

  return (
    <footer className="border-t-2 border-ink pb-10 pt-[50px]">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-8">
          <Logo />
          <div className="flex flex-wrap gap-10">
            <Column heading="EXPLORE">
              {FOOTER_EXPLORE.map((link) => (
                <Link key={link.href} href={link.href} className={LINK_CLASS}>
                  {link.label}
                </Link>
              ))}
            </Column>
            <Column heading="ELSEWHERE">
              {site.socials.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={LINK_CLASS}
                >
                  {social.platform}
                </a>
              ))}
            </Column>
            <Column heading="SITE">
              {FOOTER_SITE.map((link) => (
                <Link key={link.href} href={link.href} className={LINK_CLASS}>
                  {link.label}
                </Link>
              ))}
            </Column>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-2.5 border-t border-line pt-5 font-mono text-[0.8rem] text-ink-soft">
          <span>
            &copy; {new Date().getFullYear()} {site.name.toUpperCase()}
          </span>
          <span>{problemCount} PROBLEMS AND COUNTING</span>
        </div>
      </Container>
    </footer>
  );
}
