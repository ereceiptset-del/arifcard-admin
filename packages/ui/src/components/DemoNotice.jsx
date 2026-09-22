import { FlaskConical } from "lucide-react";

/**
 * Marks the prototype and every simulated financial figure.
 * `variant="strip"` spans a page; `variant="inline"` sits beside a value.
 */
export function DemoNotice({ children, variant = "strip", className = "" }) {
  if (variant === "inline") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-warn ${className}`}
      >
        Demo
      </span>
    );
  }

  return (
    <div
      className={`flex items-start gap-2.5 rounded-panel border border-warn/30 bg-warn/5 px-4 py-3 text-[12.5px] text-ink-soft dark:text-ink-muted-dark ${className}`}
    >
      <FlaskConical size={15} className="mt-px shrink-0 text-warn" />
      <p>{children}</p>
    </div>
  );
}
