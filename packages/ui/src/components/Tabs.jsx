/**
 * Underlined tab bar. The caller owns the active value so tabs can be
 * driven by a query parameter and stay linkable.
 */
export function Tabs({ tabs, value, onChange, ariaLabel = "Sections" }) {
  return (
    <div className="border-b border-line dark:border-line-dark">
      <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              id={`tab-${tab.value}`}
              aria-selected={active}
              aria-controls={`panel-${tab.value}`}
              onClick={() => onChange(tab.value)}
              className={`shrink-0 border-b-2 px-3 pb-2.5 pt-1 text-[13.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                active
                  ? "border-ink dark:border-ink-dark text-ink dark:text-ink-dark"
                  : "border-transparent text-ink-muted dark:text-ink-muted-dark hover:text-ink dark:hover:text-ink-dark"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TabPanel({ value, children }) {
  return (
    <div role="tabpanel" id={`panel-${value}`} aria-labelledby={`tab-${value}`} className="mt-6">
      {children}
    </div>
  );
}
