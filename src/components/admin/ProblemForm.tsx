"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Field, inputClass, monoInputClass } from "@/components/admin/Field";
import { FigureUpload } from "@/components/admin/FigureUpload";
import { MathPreview } from "@/components/admin/MathPreview";
import { StepsEditor } from "@/components/admin/StepsEditor";
import { deleteProblem, saveProblem } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { problemSchema } from "@/lib/schemas";
import { TOPIC_LIST } from "@/lib/topics";
import { DIFFICULTIES, type Problem } from "@/lib/types";

/**
 * The problem editor.
 *
 * Validation runs against `problemSchema` — the same schema the build uses —
 * here for instant feedback and again inside the Server Action, which is the
 * one that counts. The client check can only ever be a convenience.
 */

type Draft = Omit<Problem, "status"> & { status: Problem["status"] };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function ProblemForm({
  initial,
  sha,
  mode,
}: {
  initial: Draft;
  /** Blob SHA loaded with the file; absent when creating. */
  sha?: string;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(initial);
  const [currentSha, setCurrentSha] = useState(sha);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ commitUrl: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  // Only auto-derive the slug while creating and while it has not been touched.
  const [slugLocked, setSlugLocked] = useState(mode === "edit");

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setSaved(null);
  }

  function handleTitle(value: string) {
    setDraft((current) => ({
      ...current,
      title: value,
      slug: slugLocked ? current.slug : slugify(value),
    }));
    setDirty(true);
    setSaved(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const parsed = problemSchema.safeParse(draft);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[issue.path.join(".") || "form"] ??= issue.message;
      }
      setErrors(next);
      setMessage("Some fields need fixing.");
      return;
    }
    setErrors({});

    startTransition(async () => {
      const result = await saveProblem({
        data: parsed.data,
        originalSlug: mode === "edit" ? initial.slug : undefined,
        sha: currentSha,
      });

      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        setMessage(result.message);
        return;
      }

      setCurrentSha(result.sha);
      setSaved({ commitUrl: result.commitUrl });
      setDirty(false);
      if (mode === "create" || result.slug !== initial.slug) {
        router.replace(`/admin/problems/${result.slug}`);
      }
      router.refresh();
    });
  }

  function handleDelete() {
    if (!currentSha) return;
    const ok = window.confirm(
      `Delete "${initial.title}"? This commits a deletion to the repository.`,
    );
    if (!ok) return;

    startTransition(async () => {
      const result = await deleteProblem({ slug: initial.slug, sha: currentSha });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      router.replace("/admin/problems");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="pb-28">
      {/* status */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Status"
          className="inline-flex overflow-hidden rounded-ctl border-2 border-ink"
        >
          {(["draft", "published"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => set("status", value)}
              aria-pressed={draft.status === value}
              className={cn(
                "px-3.5 py-2 font-mono text-[0.74rem] uppercase",
                draft.status === value
                  ? "bg-ink text-paper"
                  : "bg-card hover:bg-paper-alt",
              )}
            >
              {value}
            </button>
          ))}
        </div>
        <p className="font-mono text-[0.7rem] uppercase text-ink-soft">
          {draft.status === "draft"
            ? "Hidden from the site until published"
            : "Live on the site after the next deploy"}
        </p>
      </div>

      <div className="grid gap-8 wide:grid-cols-[minmax(0,1fr)_300px] wide:items-start">
        <div className="min-w-0 space-y-6">
          <Field label="Title" htmlFor="title" error={errors.title}>
            <input
              id="title"
              type="text"
              value={draft.title}
              onChange={(event) => handleTitle(event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field
            label="Statement"
            htmlFor="statement"
            hint="Inline maths in $…$, a centred block in $$…$$."
            error={errors.statement}
          >
            <textarea
              id="statement"
              value={draft.statement}
              onChange={(event) => set("statement", event.target.value)}
              rows={5}
              spellCheck={false}
              className={cn(monoInputClass, "resize-y")}
            />
          </Field>

          <div className="rounded-panel border-2 border-line bg-paper p-4">
            <p className="mb-2 font-mono text-[0.68rem] uppercase tracking-wide text-ink-soft">
              Preview
            </p>
            <MathPreview text={draft.statement} className="text-[1.05rem]" />
          </div>

          <StepsEditor
            steps={draft.solutionSteps}
            onChange={(steps) => set("solutionSteps", steps)}
            error={errors.solutionSteps}
          />

          <FigureUpload
            figure={draft.figure}
            onChange={(figure) => set("figure", figure)}
            errors={errors}
          />
        </div>

        {/* sidebar */}
        <aside className="space-y-5 rounded-panel border-2 border-ink bg-card p-5">
          <Field label="Slug" htmlFor="slug" error={errors.slug}>
            <input
              id="slug"
              type="text"
              value={draft.slug}
              onChange={(event) => {
                setSlugLocked(true);
                set("slug", event.target.value);
              }}
              className={monoInputClass}
            />
          </Field>

          <Field label="Number" htmlFor="number" error={errors.number}>
            <input
              id="number"
              type="number"
              min={1}
              value={draft.number}
              onChange={(event) => set("number", Number(event.target.value))}
              className={monoInputClass}
            />
          </Field>

          <Field label="Topic" htmlFor="topic" error={errors.topic}>
            <select
              id="topic"
              value={draft.topic}
              onChange={(event) =>
                set("topic", event.target.value as Draft["topic"])
              }
              className={inputClass}
            >
              {TOPIC_LIST.map((topic) => (
                <option key={topic.slug} value={topic.slug}>
                  {topic.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Difficulty" htmlFor="difficulty" error={errors.difficulty}>
            <select
              id="difficulty"
              value={draft.difficulty}
              onChange={(event) =>
                set("difficulty", event.target.value as Draft["difficulty"])
              }
              className={inputClass}
            >
              {DIFFICULTIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Published date" htmlFor="publishedAt" error={errors.publishedAt}>
            <input
              id="publishedAt"
              type="date"
              value={draft.publishedAt}
              onChange={(event) => set("publishedAt", event.target.value)}
              className={monoInputClass}
            />
          </Field>

          <Field
            label="Thumbnail glyph"
            htmlFor="glyph"
            hint="Short expression for the video card, e.g. $P(A \mid B)$. Blank derives one."
            error={errors.glyph}
          >
            <input
              id="glyph"
              type="text"
              value={draft.glyph ?? ""}
              onChange={(event) => set("glyph", event.target.value || undefined)}
              className={monoInputClass}
            />
            {draft.glyph ? (
              <div className="mt-2 rounded-ctl border-2 border-line bg-paper px-3 py-2">
                <MathPreview text={draft.glyph} />
              </div>
            ) : null}
          </Field>

          <Field label="TikTok URL" htmlFor="tiktokUrl" error={errors.tiktokUrl}>
            <input
              id="tiktokUrl"
              type="url"
              placeholder="https://www.tiktok.com/@mirasolves/video/…"
              value={draft.tiktokUrl ?? ""}
              onChange={(event) =>
                set("tiktokUrl", event.target.value || undefined)
              }
              className={monoInputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Length (s)" htmlFor="videoSeconds" error={errors.videoSeconds}>
              <input
                id="videoSeconds"
                type="number"
                min={1}
                value={draft.videoSeconds ?? ""}
                onChange={(event) =>
                  set(
                    "videoSeconds",
                    event.target.value ? Number(event.target.value) : undefined,
                  )
                }
                className={monoInputClass}
              />
            </Field>
            <Field label="Solves" htmlFor="solveCount" error={errors.solveCount}>
              <input
                id="solveCount"
                type="number"
                min={0}
                value={draft.solveCount ?? ""}
                onChange={(event) =>
                  set(
                    "solveCount",
                    event.target.value ? Number(event.target.value) : undefined,
                  )
                }
                className={monoInputClass}
              />
            </Field>
          </div>

          {mode === "edit" ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="w-full rounded-ctl border-2 border-line py-2 font-mono text-[0.72rem] uppercase text-ink-soft hover:border-red hover:text-red disabled:opacity-50"
            >
              Delete problem
            </button>
          ) : null}
        </aside>
      </div>

      {/* save bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-ink bg-paper/95 backdrop-blur-[6px]">
        <div className="mx-auto flex max-w-wrap flex-wrap items-center gap-4 px-6 py-3.5 wide:px-8">
          <button
            type="submit"
            disabled={pending || (mode === "edit" && !dirty)}
            className="inline-flex items-center rounded-ctl border-2 border-red-dark bg-red px-5 py-[11px] font-semibold text-paper transition-transform duration-150 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
          >
            {pending
              ? "Committing…"
              : mode === "create"
                ? "Create problem"
                : "Save changes"}
          </button>

          <p
            aria-live="polite"
            className="min-w-0 flex-1 font-mono text-[0.74rem] text-ink-soft"
          >
            {message ? (
              <span className="font-medium text-red-dark">{message}</span>
            ) : saved ? (
              <>
                Saved. Live in about a minute —{" "}
                <a
                  href={saved.commitUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline"
                >
                  view commit
                </a>
              </>
            ) : dirty ? (
              "Unsaved changes"
            ) : (
              ""
            )}
          </p>
        </div>
      </div>
    </form>
  );
}
