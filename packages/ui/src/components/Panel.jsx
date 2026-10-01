/**
 * Content surface. Flat, 1px border, 20px radius — elevation is reserved
 * for overlays and the card artwork.
 */
export function Panel({ title, description, action, padded = true, as: Tag = "section", className = "", children, ...props }) {
  return (
    <Tag className={`min-w-0 rounded-panel border border-line bg-surface-1 ${className}`} {...props}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 pt-4 sm:px-6 sm:pt-5">
          <div className="min-w-0">
            {title && <h2 className="text-h3 text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-small text-ink-muted">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={padded ? "p-4 sm:p-6" : ""}>{children}</div>
    </Tag>
  );
}
