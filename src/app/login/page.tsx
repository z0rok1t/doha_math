import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { signIn } from "@/auth";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";
import { IndexCard } from "@/components/ui/IndexCard";
import { AuthSetupGuide } from "@/components/admin/AuthSetupGuide";
import { authConfigProblems } from "@/lib/admin/config";
import { safeReturnTo } from "@/lib/admin/returnTo";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  AccessDenied:
    "That GitHub account is not on the allowlist. Add its username to ADMIN_LOGINS (or its email to ADMIN_EMAILS), restart the server, and try again.",
  Configuration:
    "Sign-in is not configured. AUTH_SECRET, AUTH_GITHUB_ID and AUTH_GITHUB_SECRET all need to be set.",
  Verification: "That sign-in link has expired. Try again.",
  OAuthSignin: "Could not reach GitHub to start sign-in.",
  OAuthCallback:
    "GitHub rejected the callback. This is almost always the callback URL below not matching the one registered on the OAuth app.",
  OAuthAccountNotLinked: "That account is already linked to a different sign-in.",
  Callback:
    "The sign-in callback failed. Check that the callback URL below matches the OAuth app exactly.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const params = await props.searchParams;
  const returnTo = safeReturnTo(params.from);
  const errorKey = Array.isArray(params.error) ? params.error[0] : params.error;
  const error = errorKey
    ? (ERRORS[errorKey] ?? "Something went wrong signing in. Try again.")
    : null;

  // Bounce nobody to GitHub with credentials GitHub will not recognise: that
  // produces GitHub's own 404 page, which reads as a broken site rather than
  // an unfinished setup.
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const proto =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  /**
   * Auth.js derives redirect_uri from the host it is served on, and GitHub
   * demands an exact match with the OAuth app's registered callback. Next
   * quietly moves to 3001 when 3000 is busy, which breaks that match with no
   * visible cause — so the expected URL is shown here to compare against.
   */
  const callbackUrl = `${proto}://${host}/api/auth/callback/github`;

  const problems = authConfigProblems();
  if (problems.length > 0) {
    return (
      <Container className="max-w-[620px] py-16">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <AuthSetupGuide problems={problems} origin={`${proto}://${host}`} />
      </Container>
    );
  }

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

        <details className="mt-6 border-t-2 border-line pt-4">
          <summary className="cursor-pointer font-mono text-[0.7rem] uppercase tracking-wide text-ink-soft">
            Sign-in failing? Check this
          </summary>
          <p className="mt-3 text-[0.82rem] text-ink-soft">
            Your GitHub OAuth app&apos;s{" "}
            <strong>Authorization callback URL</strong> must be exactly this,
            character for character:
          </p>
          <code className="mt-2 block select-all break-all rounded-ctl border-2 border-line bg-paper p-2.5 font-mono text-[0.78rem]">
            {callbackUrl}
          </code>
          <p className="mt-3 text-[0.82rem] text-ink-soft">
            Note the port. Next.js moves to 3001 (then 3002…) when 3000 is
            already in use, and the registered URL then no longer matches.
            Either free the port or update the OAuth app.
          </p>
        </details>
      </IndexCard>

      <p className="mt-6 text-center font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft">
        <Link href="/" className="hover:text-red">
          &larr; Back to the site
        </Link>
      </p>
    </Container>
  );
}
