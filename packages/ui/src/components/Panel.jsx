/** White bordered surface used for every content block. */
export function Panel({ title, description, action, padded = true, className = "", children }) {
  return (
    <section
      className={`rounded-panel border border-line dark:border-line-dark bg-panel dark:bg-panel-dark shadow-panel ${className}`}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-line dark:border-line-dark px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="text-[15px] font-semibold text-ink dark:text-ink-dark">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-[13px] text-ink-muted dark:text-ink-muted-dark">
                {description}
              </p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}
