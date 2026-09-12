import { cn } from "@/lib/cn";

/** Label + control + error, so every field in the panel looks the same. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block font-mono text-[0.72rem] uppercase tracking-wide text-ink-soft"
      >
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1.5 text-[0.78rem] text-ink-soft">{hint}</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-1.5 text-[0.78rem] font-medium text-red-dark">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-ctl border-2 border-line bg-card px-3 py-2 text-[0.95rem] focus:border-ink";

export const monoInputClass =
  "w-full rounded-ctl border-2 border-line bg-card px-3 py-2 font-mono text-[0.88rem] focus:border-ink";
