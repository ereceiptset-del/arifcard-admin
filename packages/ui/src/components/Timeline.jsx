import { Check, X } from "lucide-react";
import { formatDateTime } from "../lib/format.js";

/**
 * What happened, in order. Items: `{ title, time?, detail?, state }` where
 * state is done | current | todo | failed. Only events the backend
 * recorded are passed in — never projected future dates.
 */
export function Timeline({ items, className = "" }) {
  return (
    <ol className={`relative ${className}`}>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <li key={`${item.title}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span aria-hidden className="absolute left-[11px] top-6 bottom-0 w-px bg-line" />}
            <Dot state={item.state} />
            <div className="min-w-0 pt-0.5">
              <p className={`text-small font-medium ${item.state === "todo" ? "text-ink-muted" : "text-ink"}`}>
                {item.title}
                <span className="sr-only">{` (${STATE_TEXT[item.state] || ""})`}</span>
              </p>
              {item.time && (
                <p className="text-caption text-ink-muted">
                  <time dateTime={item.time}>{formatDateTime(item.time)}</time>
                </p>
              )}
              {item.detail && <p className="mt-1 text-small text-ink-soft">{item.detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const STATE_TEXT = { done: "done", current: "in progress", todo: "not yet", failed: "failed" };

function Dot({ state }) {
  const base = "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full";
  if (state === "done") return <span className={`${base} bg-success text-surface-1`}><Check size={13} strokeWidth={3} aria-hidden /></span>;
  if (state === "failed") return <span className={`${base} bg-danger text-surface-1`}><X size={13} strokeWidth={3} aria-hidden /></span>;
  if (state === "current") return <span className={`${base} border-2 border-accent bg-surface-1`}><span className="h-2 w-2 rounded-full bg-accent" /></span>;
  return <span className={`${base} border-2 border-line-strong bg-surface-1`} />;
}
