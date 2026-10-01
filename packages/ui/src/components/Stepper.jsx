/**
 * Wizard progress header: step title, "Step n of total" and a progress bar.
 * The bar is decorative; the text carries the same information for screen
 * readers, and the whole thing is announced politely as the step changes.
 */
export function Stepper({ title, current, total }) {
  const percent = Math.round((current / total) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-h3 text-ink">{title}</h2>
        <p className="shrink-0 text-small text-ink-muted" aria-live="polite">
          Step {current} of {total}
        </p>
      </div>
      <div
        className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`${title}, step ${current} of ${total}`}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
