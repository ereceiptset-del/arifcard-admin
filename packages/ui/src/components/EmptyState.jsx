/** Zero-state block: icon, headline, explanation and optional action. */
export function EmptyState({ icon: Icon, title, description, action, dashed = false, className = "" }) {
  return (
    <div
      className={`rounded-panel px-6 py-14 text-center ${
        dashed
          ? "border border-dashed border-line-strong dark:border-line-strong-dark"
          : ""
      } ${className}`}
    >
      <div className="mx-auto max-w-sm">
        {Icon && (
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Icon size={20} />
          </span>
        )}
        <h3 className="text-[15px] font-semibold text-ink dark:text-ink-dark">{title}</h3>
        {description && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted dark:text-ink-muted-dark">
            {description}
          </p>
        )}
        {action && <div className="mt-5 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
