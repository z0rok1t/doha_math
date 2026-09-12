import Link from "next/link";
import { signOut } from "@/auth";
import { Logo } from "@/components/layout/Logo";
import { ADMIN_LINKS } from "@/lib/admin/nav";
import { AdminNavLinks } from "@/components/admin/AdminNavLinks";

/**
 * Admin chrome. Deliberately plainer than the public nav — this is a work
 * surface, not a landing page — but built from the same primitives so it does
 * not feel like a different product.
 */
export function AdminNav({
  email,
  login,
}: {
  email?: string;
  login?: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/92 backdrop-blur-[6px]">
      <div className="mx-auto flex max-w-wrap flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3.5 wide:px-8">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="rounded-mark bg-ink px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-wide text-paper">
            Admin
          </span>
        </div>

        <AdminNavLinks links={ADMIN_LINKS} />

        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/"
            className="font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft hover:text-red"
          >
            View site &rarr;
          </Link>
          {email ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
              className="flex items-center gap-3"
            >
              <span
                title={email}
                className="hidden font-mono text-[0.72rem] text-ink-soft wide:inline"
              >
                {login ? `@${login}` : email}
              </span>
              <button
                type="submit"
                className="rounded-ctl border-2 border-ink px-3 py-1.5 font-mono text-[0.72rem] uppercase hover:bg-ink hover:text-paper"
              >
                Sign out
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}
