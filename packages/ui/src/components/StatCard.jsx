/**
 * One metric. `value` is shown only when `available`; otherwise the word
 * "Unavailable" and the backend's reason — never a zero standing in for
 * an unknown. `href` + `LinkComponent` make the whole metric a link.
 */
export function StatCard({ label, value, available = true, reason, hint, tone = "default", href, LinkComponent, className = "" }) {
  const body = (
    <>
      <p className="text-small font-medium text-ink-muted">{label}</p>
      {available ? (
        <p className={`mt-1 text-h1 tabular-nums ${tone === "attention" ? "text-warning" : "text-ink"}`}>{value}</p>
      ) : (
        <>
          <p className="mt-1 text-h3 text-ink-soft">Unavailable</p>
          {reason && <p className="mt-0.5 text-caption text-ink-muted">{reason}</p>}
        </>
      )}
      {hint && available && <p className="mt-1 text-caption text-ink-muted">{hint}</p>}
    </>
  );

  const classes = `block min-w-0 p-4 sm:p-5 ${className}`;
  if (href && LinkComponent) {
    return (
      <LinkComponent to={href} className={`${classes} hover:bg-surface-2`}>
        {body}
      </LinkComponent>
    );
  }
  return <div className={classes}>{body}</div>;
}
