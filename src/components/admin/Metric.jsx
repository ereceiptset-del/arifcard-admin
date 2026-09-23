import { Link } from "react-router-dom";

/**
 * One measured figure.
 *
 * The backend sends every metric as `{ available, value }` or
 * `{ available: false, reason }`, and this renders the difference rather
 * than flattening it. A metric that could not be computed shows why —
 * never `0`, because zero means "we counted, and there were none", and a
 * dash where a number belongs invites someone to assume the worst or the
 * best depending on their mood.
 */
export function Metric({ label, metric, format = (n) => n, to, hint, tone = "neutral" }) {
  const available = metric?.available !== false;
  const shown = available ? format(metric?.value ?? 0) : "unavailable";

  const body = (
    <>
      <p className="text-[12.5px] text-ink-muted dark:text-ink-muted-dark">{label}</p>
      <p
        className={`mt-1.5 font-mono leading-none ${
          available ? "text-[24px] text-ink dark:text-ink-dark" : "text-[13px] text-ink-faint"
        }`}
      >
        {shown}
      </p>
      {!available && metric?.reason && (
        <p className="mt-1.5 text-[11px] text-ink-faint">{metric.reason}</p>
      )}
      {available && hint && <p className="mt-1.5 text-[11px] text-ink-faint">{hint}</p>}
    </>
  );

  const base = `rounded-panel border p-4 ${
    tone === "warn"
      ? "border-warn/30 bg-warn/5"
      : "border-line dark:border-line-dark bg-panel dark:bg-panel-dark"
  }`;

  // Only a metric that leads somewhere is a link. A tile that looks
  // clickable and is not is worse than one that does not.
  if (to && available) {
    return (
      <Link to={to} className={`${base} block transition-colors hover:border-brand/40`}>
        {body}
      </Link>
    );
  }
  return <div className={base}>{body}</div>;
}

/**
 * A small bar chart, drawn inline.
 *
 * No chart library: this is a handful of rectangles, and a dependency for
 * that would be more code to keep current than the code it replaces. It
 * shows only days the data covers, so an empty stretch reads as "nothing
 * happened" rather than as a gap in the chart.
 */
export function BarChart({ title, series, format = (n) => n, empty = "Nothing in this period" }) {
  const days = Object.keys(series || {}).sort();
  const max = Math.max(1, ...days.map((d) => series[d]));

  return (
    <div>
      <p className="text-[13px] font-medium text-ink dark:text-ink-dark">{title}</p>
      {days.length === 0 ? (
        <p className="mt-3 text-[12.5px] text-ink-faint">{empty}</p>
      ) : (
        <div className="mt-3 flex h-28 items-end gap-1" role="img" aria-label={title}>
          {days.map((day) => {
            const n = series[day];
            return (
              <div key={day} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-ink-faint">{format(n)}</span>
                <div
                  className="w-full rounded-t bg-brand/70"
                  style={{ height: `${Math.max(3, (n / max) * 100)}%` }}
                  title={`${day}: ${format(n)}`}
                />
                <span className="truncate text-[9px] text-ink-faint">{day.slice(5)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
