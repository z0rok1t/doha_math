"use client";

import { useRef, useState } from "react";
import { Field, inputClass } from "@/components/admin/Field";
import { uploadFigure } from "@/lib/admin/actions";
import type { Problem } from "@/lib/types";

type Figure = NonNullable<Problem["figure"]>;

/**
 * Diagram upload.
 *
 * Because content lives in the repository, the image is committed like any
 * other file — there is no blob store in the stack.
 *
 * Dimensions are measured here, in the browser, before upload: the raster
 * formats via naturalWidth, SVG by reading its own width/height or viewBox.
 * That keeps the server free of an image-decoding dependency and means the
 * author never has to look up pixel sizes by hand.
 */
async function measure(file: File): Promise<{ width: number; height: number }> {
  if (file.type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg")) {
    const text = await file.text();
    const widthAttr = /\bwidth\s*=\s*["']?([\d.]+)/i.exec(text)?.[1];
    const heightAttr = /\bheight\s*=\s*["']?([\d.]+)/i.exec(text)?.[1];
    if (widthAttr && heightAttr) {
      return { width: Math.round(+widthAttr), height: Math.round(+heightAttr) };
    }
    const viewBox = /\bviewBox\s*=\s*["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)/i.exec(text);
    if (viewBox) {
      return { width: Math.round(+viewBox[1]), height: Math.round(+viewBox[2]) };
    }
    throw new Error(
      "That SVG has no width/height or viewBox, so its size cannot be determined. Add one.",
    );
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("That file is not a readable image."));
      element.src = url;
    });
    return { width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      // strip the "data:...;base64," prefix
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export function FigureUpload({
  figure,
  onChange,
  errors,
}: {
  figure: Figure | undefined;
  onChange: (next: Figure | undefined) => void;
  errors?: Record<string, string>;
}) {
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setProblem(null);
    try {
      const [{ width, height }, base64] = await Promise.all([
        measure(file),
        toBase64(file),
      ]);
      const result = await uploadFigure({ name: file.name, base64 });
      if (!result.ok) {
        setProblem(result.message);
        return;
      }
      onChange({
        src: result.src,
        alt: figure?.alt ?? "",
        caption: figure?.caption,
        width,
        height,
      });
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="rounded-panel border-2 border-ink bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft">
          Diagram (optional)
        </h2>
        {figure ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="font-mono text-[0.72rem] uppercase text-ink-soft hover:text-red"
          >
            Remove
          </button>
        ) : null}
      </div>

      {problem ? (
        <p role="alert" className="mb-3 text-[0.8rem] font-medium text-red-dark">
          {problem}
        </p>
      ) : null}

      {figure ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- same reasoning as ProblemFigure: first-party SVG line art */}
            <img
              src={figure.src}
              alt=""
              width={figure.width}
              height={figure.height}
              className="h-auto w-[140px] rounded-card border-2 border-line bg-card"
            />
            <p className="font-mono text-[0.72rem] leading-relaxed text-ink-soft">
              {figure.src}
              <br />
              {figure.width} × {figure.height} px
            </p>
          </div>

          <Field
            label="Alt text (required)"
            htmlFor="figure-alt"
            hint="Describe what the diagram shows. Without this it is invisible to anyone using a screen reader."
            error={errors?.["figure.alt"]}
          >
            <textarea
              id="figure-alt"
              value={figure.alt}
              onChange={(event) =>
                onChange({ ...figure, alt: event.target.value })
              }
              rows={2}
              className={inputClass}
            />
          </Field>

          <Field
            label="Caption (optional)"
            htmlFor="figure-caption"
            hint="Rendered in small uppercase mono, so avoid maths variables — “side a + b” becomes “SIDE A + B”."
            error={errors?.["figure.caption"]}
          >
            <input
              id="figure-caption"
              type="text"
              value={figure.caption ?? ""}
              onChange={(event) =>
                onChange({
                  ...figure,
                  caption: event.target.value || undefined,
                })
              }
              className={inputClass}
            />
          </Field>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
            className="block w-full font-mono text-[0.8rem] file:mr-3 file:rounded-ctl file:border-2 file:border-ink file:bg-card file:px-3 file:py-1.5 file:font-mono file:text-[0.72rem] file:uppercase"
          />
          <p className="mt-2 font-mono text-[0.68rem] uppercase leading-relaxed text-ink-soft">
            {busy
              ? "Uploading and committing…"
              : "SVG, PNG, JPG or WebP, up to 2 MB. Committed to public/problems/."}
          </p>
        </>
      )}
    </section>
  );
}
