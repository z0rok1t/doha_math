import type { ConfigProblem } from "@/lib/admin/config";

/**
 * Shown on /login when sign-in is not configured yet, in place of a button
 * that would only lead to GitHub's 404 page.
 *
 * The callback URL is built from the actual request host, so it can be copied
 * verbatim instead of guessed — getting that field wrong is the other common
 * way this setup fails.
 */
export function AuthSetupGuide({
  problems,
  origin,
}: {
  problems: ConfigProblem[];
  origin: string;
}) {
  const callback = `${origin}/api/auth/callback/github`;

  return (
    <div className="rounded-panel border-2 border-ink bg-card p-7">
      <h1 className="mb-2 text-[1.4rem]">Sign-in isn&apos;t set up yet</h1>
      <p className="mb-6 text-[0.95rem] text-ink-soft">
        This is the last setup step, and it has to be done by hand — GitHub has
        no API for creating OAuth apps. Two minutes.
      </p>

      <ol className="mb-7 space-y-5">
        <li>
          <p className="mb-2 font-semibold">
            1. Create an OAuth app on GitHub
          </p>
          <a
            href="https://github.com/settings/applications/new"
            target="_blank"
            rel="noreferrer noopener"
            className="mb-3 inline-flex items-center rounded-ctl border-2 border-ink bg-ink px-4 py-2 text-[0.88rem] font-semibold text-paper"
          >
            Open github.com/settings/applications/new &rarr;
          </a>
          <dl className="space-y-2 rounded-ctl border-2 border-line bg-paper p-3 font-mono text-[0.76rem]">
            <div>
              <dt className="text-ink-soft">Application name</dt>
              <dd className="select-all">Mira Solves Admin</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Homepage URL</dt>
              <dd className="select-all break-all">{origin}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Authorization callback URL</dt>
              <dd className="select-all break-all font-semibold">{callback}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[0.82rem] text-ink-soft">
            Then press <strong>Generate a new client secret</strong> and keep
            the page open — the secret is only shown once.
          </p>
        </li>

        <li>
          <p className="mb-2 font-semibold">
            2. Put these in <code className="font-mono">.env.local</code>
          </p>
          <ul className="space-y-2">
            {problems.map((problem) => (
              <li
                key={problem.key}
                className="rounded-ctl border-2 border-red bg-card p-3"
              >
                <code className="font-mono text-[0.82rem] font-semibold text-red-dark">
                  {problem.key}
                </code>
                <p className="mt-1 text-[0.82rem] text-ink-soft">
                  {problem.message}
                </p>
              </li>
            ))}
          </ul>
        </li>

        <li>
          <p className="font-semibold">3. Restart the dev server</p>
          <p className="mt-1 text-[0.85rem] text-ink-soft">
            Next only reads <code className="font-mono">.env.local</code> at
            startup, so stop and re-run{" "}
            <code className="font-mono">npm run dev</code>. Then reload this
            page.
          </p>
        </li>
      </ol>

      <p className="border-t-2 border-ink pt-4 font-mono text-[0.72rem] uppercase leading-relaxed text-ink-soft">
        Only the values above are missing. Everything else is already
        configured.
      </p>
    </div>
  );
}
