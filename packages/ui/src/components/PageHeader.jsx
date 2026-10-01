/** Page title row: title, one line of context, actions on the right. */
export function PageHeader({ title, description, actions, meta, className = "" }) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-6 gap-y-3 ${className}`}>
      <div className="min-w-0">
        <h1 className="text-h1 text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-[72ch] text-body text-ink-muted">{description}</p>}
        {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
