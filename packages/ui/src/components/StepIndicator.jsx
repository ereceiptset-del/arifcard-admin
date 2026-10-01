import { Check, TriangleAlert } from "lucide-react";

/**
 * A short checklist of steps toward a goal. Steps: `{ label, state, detail? }`
 * where state is done | current | todo | blocked. `orientation="horizontal"`
 * is the compact wizard header.
 */
export function StepIndicator({ steps, orientation = "vertical", label = "Progress", className = "" }) {
  const horizontal = orientation === "horizontal";
  return (
    <ol aria-label={label} className={`${horizontal ? "flex items-center gap-2" : "flex flex-col gap-3"} ${className}`}>
      {steps.map((step, index) => (
        <li
          key={step.label}
          aria-current={step.state === "current" ? "step" : undefined}
          className={`flex min-w-0 items-start gap-3 ${horizontal ? "flex-1" : ""}`}
        >
          <Marker state={step.state} number={index + 1} />
          <div className={`min-w-0 ${horizontal ? "sr-only sm:not-sr-only" : ""}`}>
            <p
              className={`text-small ${
                step.state === "current" || step.state === "blocked"
                  ? "font-semibold text-ink"
                  : step.state === "done"
                    ? "text-ink-soft"
                    : "text-ink-muted"
              }`}
            >
              {step.label}
              <span className="sr-only">{` (${STATE_TEXT[step.state]})`}</span>
            </p>
            {step.detail && <p className="mt-0.5 text-caption text-ink-muted">{step.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

const STATE_TEXT = { done: "done", current: "current step", todo: "not started", blocked: "needs attention" };

function Marker({ state, number }) {
  const base = "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-caption font-semibold tabular-nums";
  if (state === "done") return <span aria-hidden className={`${base} bg-success-tint text-success`}><Check size={14} strokeWidth={3} /></span>;
  if (state === "blocked") return <span aria-hidden className={`${base} bg-warning-tint text-warning`}><TriangleAlert size={13} strokeWidth={2.5} /></span>;
  if (state === "current") return <span aria-hidden className={`${base} bg-accent text-on-accent`}>{number}</span>;
  return <span aria-hidden className={`${base} border border-line-strong text-ink-muted`}>{number}</span>;
}
