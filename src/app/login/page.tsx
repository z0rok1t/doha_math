import type { Metadata } from "next";
import Link from "next/link";
import { signIn } from "@/auth";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { IndexCard } from "@/components/ui/IndexCard";
import { safeReturnTo } from "@/lib/admin/returnTo";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  AccessDenied:
    "That GitHub account is not on the allowlist. Add its username to ADMIN_LOGINS (or its email to ADMIN_EMAILS) and try again.",
  Configuration:
    "Sign-in is not configured. AUTH_SECRET, AUTH_GITHUB_ID and AUTH_GITHUB_SECRET all need to be set.",
  Verification: "That sign-in link has expired. Try again.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const params = await props.searchParams;
  const returnTo = safeReturnTo(params.from);
  const errorKey = Array.isArray(params.error) ? params.error[0] : params.error;
  const error = errorKey
    ? (ERRORS[errorKey] ?? "Something went wrong signing in. Try again.")
    : null;

  return (
    <Container className="flex min-h-dvh max-w-[460px] flex-col justify-center py-16">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>

      <IndexCard shadow="yellow" className="p-8">
        <h1 className="mb-2 text-[1.5rem]">Sign in to the panel</h1>
        <p className="mb-6 text-[0.95rem] text-ink-soft">
          Content is edited here and committed to the site&apos;s repository, so
          sign in with the GitHub account that has access to it.
        </p>

        {error ? (
          <p
            role="alert"
            className="mb-6 rounded-ctl border-2 border-red bg-card p-3 text-[0.88rem] text-red-dark"
          >
            {error}
          </p>
        ) : null}

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: returnTo });
          }}
        >
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-ctl border-2 border-ink bg-ink px-5 py-3 font-semibold text-paper transition-transform duration-150 hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-2.91-.88-2.91-3.26 0-.68.24-1.24.64-1.67-.06-.16-.28-.81.06-1.68 0 0 .52-.17 1.7.64a5.7 5.7 0 0 1 3.1 0c1.18-.81 1.7-.64 1.7-.64.34.87.12 1.52.06 1.68.4.43.64.99.64 1.67 0 2.39-1.14 3.06-2.92 3.26.3.26.56.76.56 1.53 0 1.1-.01 1.99-.01 2.26 0 .21.15.46.55.38A7.99 7.99 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
              />
            </svg>
            Continue with GitHub
          </button>
        </form>
      </IndexCard>

      <p className="mt-6 text-center font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft">
        <Link href="/" className="hover:text-red">
          &larr; Back to the site
        </Link>
      </p>
    </Container>
  );
}
