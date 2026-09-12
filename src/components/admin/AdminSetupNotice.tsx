/**
 * Shown when the panel can reach itself but not the repository — almost always
 * a missing or wrong env var on a first run. Better than an error page.
 */
export function AdminSetupNotice({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mb-8 rounded-panel border-2 border-red bg-card p-6"
    >
      <h2 className="mb-2 text-[1.2rem] text-red-dark">
        Cannot reach the content repository
      </h2>
      <p className="mb-4 text-[0.95rem]">{message}</p>
      <p className="font-mono text-[0.72rem] uppercase leading-relaxed text-ink-soft">
        Check GITHUB_REPO, GITHUB_BRANCH and GITHUB_OAUTH_SCOPE — see
        .env.example.
      </p>
    </div>
  );
}
