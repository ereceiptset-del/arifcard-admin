/** Zero state: icon, headline, one line that invites action, optional action. */
export function EmptyState({ icon: Icon, title, description, action, dashed = false, compact = false, headingLevel = 3, className = "" }) {
  const Heading = `h${headingLevel}`;
  return (
    <div
      className={`rounded-panel text-center ${compact ? "px-4 py-8" : "px-6 py-12"} ${
        dashed ? "border border-dashed border-line-strong" : ""
      } ${className}`}
    >
      <div className="mx-auto max-w-sm">
        {Icon && (
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-ink-soft">
            <Icon size={20} aria-hidden />
          </span>
        )}
        <Heading className="text-h3 text-ink">{title}</Heading>
        {description && <p className="mt-1 text-small text-ink-muted">{description}</p>}
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
